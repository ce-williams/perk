-- Production FOUNDATION only. Review and test in a Supabase sandbox before deployment.
-- No fictional demo catalog is inserted into the production catalog.
begin;
create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create type public.evidence_state as enum ('confirmed','self-reported','estimated','unknown');
create type public.enrollment_state as enum ('unknown','not-enrolled','enrolled','not-required');
create type public.eligibility_state as enum ('unknown','eligible','ineligible');
create type public.content_state as enum ('demo','unverified','verified','stale');
create type public.reset_cadence as enum ('monthly','quarterly','calendar-year','anniversary');
create table public.issuers(id uuid primary key default gen_random_uuid(),name text not null,approved_host text not null unique);
create table public.card_products(id uuid primary key default gen_random_uuid(),issuer_id uuid not null references public.issuers,name text not null,slug text not null unique);
create table public.card_variants(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.card_products,name text not null,market text not null default 'US',network text,status public.content_state not null default 'unverified');
create table public.benefit_definitions(id uuid primary key default gen_random_uuid(),variant_id uuid not null references public.card_variants,stable_key text not null,unique(variant_id,stable_key));
create table public.benefit_revisions(
 id uuid primary key default gen_random_uuid(),benefit_id uuid not null references public.benefit_definitions,
 title text not null,valid_from date not null,valid_to date,cap_cents bigint check(cap_cents>=0),currency text not null default 'USD' check(currency='USD'),
 cadence public.reset_cadence not null,reset_timezone text not null,enrollment_required boolean not null,
 eligibility_rules jsonb not null default '{}',instructions text not null,status public.content_state not null default 'unverified',
 verified_at timestamptz,verified_by uuid references auth.users,created_at timestamptz not null default now(),
 check(valid_to is null or valid_to>valid_from),check(status<>'verified' or (verified_at is not null and verified_by is not null)),
 exclude using gist(benefit_id with =,daterange(valid_from,valid_to,'[)') with &&)
);
create table public.benefit_sources(id uuid primary key default gen_random_uuid(),revision_id uuid not null references public.benefit_revisions,url text not null check(url ~ '^https://'),checked_at timestamptz,source_excerpt text,reviewer_id uuid references auth.users);
create table public.approved_links(id uuid primary key default gen_random_uuid(),revision_id uuid not null references public.benefit_revisions,url text not null check(url ~ '^https://'),purpose text not null check(purpose in ('terms','enrollment','redemption')),approved_at timestamptz not null,approved_by uuid not null references auth.users);
create table public.households(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users,name text not null);
create table public.household_memberships(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households,user_id uuid not null references auth.users,role text not null check(role in ('owner','member')),accepted_at timestamptz,unique(household_id,user_id));
create table public.user_cards(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,variant_id uuid not null references public.card_variants,household_id uuid references public.households,nickname text,opened_on date,annual_fee_cents bigint check(annual_fee_cents>=0),archived_at timestamptz,created_at timestamptz not null default now(),unique(id,user_id));
create table public.user_benefit_states(card_id uuid not null,user_id uuid not null references auth.users,benefit_id uuid not null references public.benefit_definitions,eligibility public.eligibility_state not null default 'unknown',enrollment public.enrollment_state not null default 'unknown',enrollment_evidence public.evidence_state not null default 'unknown',relevant boolean not null default true,updated_at timestamptz not null default now(),primary key(card_id,benefit_id),foreign key(card_id,user_id) references public.user_cards(id,user_id));
create table public.enrollment_events(id uuid primary key default gen_random_uuid(),card_id uuid not null,user_id uuid not null references auth.users,benefit_id uuid not null references public.benefit_definitions,from_state public.enrollment_state not null,to_state public.enrollment_state not null,evidence public.evidence_state not null,explicit_confirmation boolean not null check(explicit_confirmation),recorded_at timestamptz not null default now(),foreign key(card_id,user_id) references public.user_cards(id,user_id));
create table public.usage_records(id uuid primary key default gen_random_uuid(),card_id uuid not null,user_id uuid not null references auth.users,revision_id uuid not null references public.benefit_revisions,cents bigint not null check(cents>0),service_date date not null,evidence public.evidence_state not null,reverses uuid references public.usage_records,recorded_at timestamptz not null default now(),foreign key(card_id,user_id) references public.user_cards(id,user_id),unique(reverses));
create table public.user_preferences(user_id uuid primary key references auth.users,timezone text not null default 'America/Denver',reminders_opted_in boolean not null default false,lead_days integer not null default 3 check(lead_days in (1,3,7)));
create table public.subscriptions(user_id uuid primary key references auth.users,stripe_customer_id text unique,stripe_subscription_id text unique,status text not null,entitlements jsonb not null default '{}',updated_at timestamptz not null default now());
create table public.webhook_events(event_id text primary key,received_at timestamptz not null default now(),processed_at timestamptz,last_error text);
create table public.reminder_jobs(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,card_id uuid not null references public.user_cards,revision_id uuid not null references public.benefit_revisions,period_start date not null,channel text not null,lead_days integer not null,due_at timestamptz not null,status text not null default 'pending',attempts integer not null default 0,lease_until timestamptz,last_error text,unique(user_id,card_id,revision_id,period_start,channel,lead_days));
create table public.catalog_reviews(id uuid primary key default gen_random_uuid(),revision_id uuid not null references public.benefit_revisions,due_at timestamptz not null,status text not null default 'pending',notes text);
-- Published revisions are immutable except closing their validity range.
create function public.protect_revision() returns trigger language plpgsql as $$begin
 if tg_op='DELETE' then raise exception 'Revision deletion is prohibited'; end if;
 if (to_jsonb(new)-'valid_to') is distinct from (to_jsonb(old)-'valid_to') then raise exception 'Append a revision instead of editing historical terms'; end if;
 return new;
end$$;
create trigger immutable_revision before update or delete on public.benefit_revisions for each row execute function public.protect_revision();
-- Every private record validates benefit / variant consistency as well as ownership.
create function public.validate_benefit_record() returns trigger language plpgsql set search_path='' as $$declare expected_variant uuid;actual_variant uuid;original public.usage_records;
begin
 select c.variant_id into actual_variant from public.user_cards c where c.id=new.card_id and c.user_id=new.user_id;
 if actual_variant is null then raise exception 'Card owner mismatch'; end if;
 if tg_table_name='usage_records' then
  select b.variant_id into expected_variant from public.benefit_definitions b join public.benefit_revisions r on r.benefit_id=b.id where r.id=new.revision_id and new.service_date>=r.valid_from and (r.valid_to is null or new.service_date<r.valid_to);
  if new.service_date>current_date then raise exception 'Future usage prohibited'; end if;
  if new.reverses is not null then select * into original from public.usage_records where id=new.reverses; if original.id is null or original.reverses is not null or original.card_id<>new.card_id or original.user_id<>new.user_id or original.revision_id<>new.revision_id or original.cents<>new.cents or original.service_date<>new.service_date then raise exception 'Reversal must match original record'; end if; end if;
 else select b.variant_id into expected_variant from public.benefit_definitions b where b.id=new.benefit_id;
 end if;
 if expected_variant is distinct from actual_variant then raise exception 'Benefit does not belong to this card variant or date'; end if;
 return new;
end$$;
create trigger validate_usage before insert on public.usage_records for each row execute function public.validate_benefit_record();
create trigger validate_enrollment before insert on public.enrollment_events for each row execute function public.validate_benefit_record();
create trigger validate_state before insert or update on public.user_benefit_states for each row execute function public.validate_benefit_record();
-- RLS: catalog writes, billing, jobs and household management are service-owned.
do $$declare t text;begin foreach t in array array['issuers','card_products','card_variants','benefit_definitions','benefit_revisions','benefit_sources','approved_links','households','household_memberships','user_cards','user_benefit_states','enrollment_events','usage_records','user_preferences','subscriptions','webhook_events','reminder_jobs','catalog_reviews'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon, authenticated',t);end loop;end$$;
grant select on public.issuers,public.card_products,public.card_variants,public.benefit_definitions,public.benefit_revisions,public.benefit_sources,public.approved_links to authenticated;
create policy read_issuers on public.issuers for select to authenticated using(true);
create policy read_products on public.card_products for select to authenticated using(true);
create policy read_variants on public.card_variants for select to authenticated using(status='verified');
create policy read_definitions on public.benefit_definitions for select to authenticated using(exists(select 1 from public.card_variants v where v.id=variant_id and v.status='verified'));
create policy read_revisions on public.benefit_revisions for select to authenticated using(status='verified' and exists(select 1 from public.benefit_definitions b where b.id=benefit_id));
create policy read_sources on public.benefit_sources for select to authenticated using(exists(select 1 from public.benefit_revisions r where r.id=revision_id and r.status='verified'));
create policy read_links on public.approved_links for select to authenticated using(exists(select 1 from public.benefit_revisions r where r.id=revision_id and r.status='verified'));
grant select,insert,update on public.user_cards,public.user_benefit_states,public.user_preferences to authenticated;
create policy own_cards on public.user_cards for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and household_id is null);
create policy own_states on public.user_benefit_states for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and enrollment_evidence in ('unknown','self-reported'));
create policy own_preferences on public.user_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
-- Append-only evidence: no client UPDATE or DELETE grants.
grant select,insert on public.usage_records,public.enrollment_events to authenticated;
create policy read_own_usage on public.usage_records for select to authenticated using(user_id=(select auth.uid()));
create policy insert_own_usage on public.usage_records for insert to authenticated with check(user_id=(select auth.uid()) and evidence='self-reported');
create policy read_own_enrollment on public.enrollment_events for select to authenticated using(user_id=(select auth.uid()));
create policy insert_own_enrollment on public.enrollment_events for insert to authenticated with check(user_id=(select auth.uid()) and evidence='self-reported');
grant select on public.subscriptions to authenticated;
create policy read_own_subscription on public.subscriptions for select to authenticated using(user_id=(select auth.uid()));
create index user_cards_owner on public.user_cards(user_id);
create index usage_owner_date on public.usage_records(user_id,service_date);
create index usage_card_revision on public.usage_records(card_id,revision_id);
create index reminders_due on public.reminder_jobs(due_at) where status='pending';
-- Production writes must use transactional RPCs for rule checks, concurrency locking,
-- enrollment event + state synchronization, server confirmation, and append-only reversals.
-- Those RPCs and cross-user integration tests are launch gates, not claimed by this migration.
commit;

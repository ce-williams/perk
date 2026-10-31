import { test } from "node:test";
import assert from "node:assert/strict";
import {
  benefits,
  catalog,
  demoBenefitsFor,
  getProduct,
} from "../src/lib/catalog";
import { actionsFor } from "../src/lib/rules";
import { emptyStore } from "../src/lib/storage";

test("Fidelity can be discovered by card name or issuer and links to published terms", () => {
  const product = getProduct("fidelity-rewards");
  assert.match(`${product.name} ${product.issuer}`, /Fidelity.*Elan/);
  assert.equal(catalog.filter((p) => p.id === product.id).length, 1);
  assert.equal(product.publishedBenefits?.items.length, 6);
  assert.equal(new URL(product.officialUrl).hostname, "www.fidelity.com");
  assert.ok(
    product.publishedBenefits?.items.some((b) =>
      /eligible Fidelity account/.test(b.description),
    ),
  );
});

test("Fidelity does not inherit fictional allowances or actions in a mixed wallet", () => {
  const store = emptyStore();
  store.cards = ["fidelity-rewards", "chase-reserve"].map((productId) => ({
    id: productId,
    productId,
    openedOn: "2025-01-01",
    annualFeeCents: null,
    archived: false,
  }));
  assert.deepEqual(demoBenefitsFor("fidelity-rewards"), []);
  assert.equal(demoBenefitsFor("chase-reserve").length, 4);
  const actions = actionsFor(store, benefits, "2026-10-30");
  assert.equal(actions.length, 4);
  assert.ok(
    actions.every((action) => action.card.productId === "chase-reserve"),
  );
});

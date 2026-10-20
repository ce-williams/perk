import Link from "next/link";
export default function Directions() {
  return (
    <main className="directions-page">
      <Link href="/" className="wordmark">
        perk<span>®</span>
      </Link>
      <h1>
        Two ways to make
        <br />
        more of what is yours.
      </h1>
      <p className="muted">
        Original visual studies for PERK. All amounts below are fictional
        demonstration data.
      </p>
      <div className="direction-grid">
        <section>
          <h2>The Benefits Journal</h2>
          <p>A little space. A clear next step.</p>
          <div className="study journal">
            <header>
              <b>perk</b>
              <span>Overview　 My cards　 Actions</span>
            </header>
            <div className="study-content">
              <h3>
                Your cards.
                <br />
                More possibilities.
              </h3>
              <div className="study-feature">
                <span>Dining · fictional demo</span>
                <h4>
                  Make the most
                  <br />
                  of this month.
                </h4>
                <p>$25 remaining · resets October 31</p>
                <button type="button">Review enrollment →</button>
              </div>
              <div className="study-row">
                <b>A meal worth remembering</b>
                <span>$25 / month</span>
              </div>
              <div className="study-row">
                <b>A little further, for a little less</b>
                <span>$120 / year</span>
              </div>
            </div>
          </div>
          <p>
            Upright serif, warm paper, forest ink, wide action rows and
            expressive card geometry. The next action leads; accounting supports
            it.
          </p>
        </section>
        <section>
          <h2>The Private Ledger</h2>
          <p>A sharper view of the whole portfolio.</p>
          <div className="study ledger">
            <header>
              <b>PERK /</b>
              <span>PORTFOLIO　 ACTIONS　 ACTIVITY</span>
            </header>
            <div className="study-content">
              <h3>
                The portfolio,
                <br />
                accounted for.
              </h3>
              <div className="ledger-total">
                <span>SELF-REPORTED · FICTIONAL</span>
                <strong>$45.00</strong>
                <small>Recorded this calendar year</small>
              </div>
              <div className="ledger-head">
                NEXT RESET <span>BENEFIT / STATUS</span>
                <span>AVAILABLE</span>
              </div>
              <div className="ledger-entry">
                <b>31 OCT</b>
                <span>
                  Dining allowance
                  <br />
                  <small>Enrollment unknown</small>
                </span>
                <strong>$25</strong>
              </div>
              <div className="ledger-entry">
                <b>31 DEC</b>
                <span>
                  Travel allowance
                  <br />
                  <small>Eligibility unknown</small>
                </span>
                <strong>$120</strong>
              </div>
            </div>
          </div>
          <p>
            <strong>Selected by you.</strong> Condensed sans, forest canvas,
            ivory work areas and a tight date-column rhythm. More information
            per glance; better suited to frequent portfolio reviews.
          </p>
        </section>
      </div>
      <div className="direction-verdict">
        <h2>Carry the ledger forward.</h2>
        <p>
          Your selected direction is The Private Ledger. The final application
          adapts its compact portfolio-first composition to deep ink blue, warm
          ivory and burnt orange, following your palette preference. These two
          original studies are retained for comparison.
        </p>
        <Link className="button primary" href="/">
          Explore the MVP →
        </Link>
      </div>
    </main>
  );
}

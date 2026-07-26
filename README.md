# MiyarMint

A clear standard for halal investing. Practice risk-free, see the compliance logic in plain terms, invest for real starting at $100.

This repo contains a **UI-only prototype** (`index.html`, single file, no build step) plus the plan for the real backend. Open `index.html` in a browser and click "Launch demo."

---

## 2-minute pitch script

*(~300 words, paced for 2 minutes)*

> Here's the problem: most young Muslims want to invest, but they either don't know how to check if a stock is halal, or they find a screening tool that tells them "yes" or "no" and then leaves them stranded — no account, no next step. On the other side, the halal brokerages that do exist ask for real money before you've ever placed a trade. For a 17-year-old with their first paycheck, that's a wall, not a front door.
>
> MiyarMint fixes the order of operations. You start in a free simulation tier — real prices, a mock portfolio, zero dollars at risk. Every fund you look at shows its compliance breakdown in plain terms: business activity, debt ratio, interest income, pass or fail, no black box. Once you're ready, the same interface goes live with a $100 minimum, backed by a real brokerage connection.
>
> We're not trying to out-compete existing brokerages on trading features. We're filling the step before the brokerage — the practice, the transparency, the trust-building — that nobody else offers for free.
>
> The market underneath this is real without needing to round up: roughly three and a half million Muslims in the US today, more than a third of them under thirty — exactly the segment current halal investing products weren't built for. That's our year-one market. The global Muslim population is nearly two billion, and that's the long-term opportunity, but we're not pretending international expansion is a switch we flip on day one — it's licensing and compliance, country by country, after we prove the US model.
>
> What you're about to see is a working prototype: a portfolio dashboard, a searchable list of halal-screened ETFs, and a full buy and sell flow, all running against the Miyar compliance standard.
>
> What we're asking for is help getting to the next stage: a licensed brokerage integration to execute real trades, a plan for custodial accounts so we can responsibly serve investors under 18, and support building the research pipeline that turns aggregated, anonymized screening data into better halal investment tools over time.

---

## Demo walkthrough

1. **Landing page** — the pitch: problem, differentiation table (screeners vs. existing halal brokerages vs. MiyarMint), the three-step model (Simulate → Screen → Invest), and the market-sizing section with cited figures.
2. **Launch demo** — opens the app shell, styled as a phone-width device.
3. **Portfolio dashboard** — total value, day change, an allocation bar across current holdings, and the **Miyar Score** gauge (the recurring three-arc visual: business activity / debt ratio / interest income).
4. **Explore tab** — search across five screened ETFs, each with a one-line reason for inclusion.
5. **Fund detail** — tap any fund to see its full compliance breakdown (each criterion, its actual figure, its threshold, pass/fail) and the Buy/Sell flow.
6. **Practice ↔ Live toggle** — switching to Live mode changes the banner and disables simulated fills, surfacing the message a real user would see: live trading needs a connected brokerage account.

All market data, prices, and ETF names in the prototype are **fictional and illustrative** — built for the demo, not real securities or real compliance output.

---

## Backend integration plan

The prototype is intentionally UI-only. Here's what plugs in behind it:

### 1. Accounts & data — Supabase
- Supabase Auth for user sign-up/login (email + OAuth).
- Postgres tables for user profiles, simulated portfolios, watchlists, and trade history.
- Row-level security so each user only reads their own portfolio and trade data.
- Practice-mode portfolios and balances live entirely in Supabase — no money movement, no brokerage call.

### 2. Market data — Financial Modeling Prep (FMP)
- Real-time and delayed quotes, historical price series for charts, and fund metadata (holdings, expense ratio) for each tradable ETF.
- Cached server-side on a short TTL to stay inside free-tier rate limits as usage grows.

### 3. Compliance screening — Halal Terminal API + HalalSignalz
- Halal Terminal API supplies the live screening computation: business activity classification, debt-to-market-cap ratio, and interest-income ratio, checked against a defined threshold (the numbers shown in the fund detail view).
- HalalSignalz acts as a fallback reference passlist if the live screening API is unavailable, and as a sanity check against the primary source.
- The methodology and thresholds are shown directly in the UI (as in the prototype's fund detail view) rather than reduced to a single certified/not-certified badge — this transparency is the core product differentiator and should not be simplified away as the real integration is built.

### 4. Trade execution — brokerage-as-a-service
- Live trades require a licensed broker-dealer partner rather than MiyarMint holding a broker-dealer license directly. Candidates to evaluate: Alpaca Broker API, DriveWealth, or a similar embedded-brokerage provider that handles custody, clearing, and regulatory reporting.
- MiyarMint's job in this layer is order routing and portfolio display; the partner handles KYC/AML, account custody, and trade settlement.
- The ETF universe stays intentionally small and curated (not a general brokerage) so every tradable security has gone through the compliance screen before it's ever offered.

### 5. Custodial accounts for under-18 users
- US securities law requires a custodial (UTMA/UGMA) structure for minors, with a parent or guardian as the account owner of record.
- This needs its own onboarding flow (parent identity verification, linked guardian account, transfer-of-control at age of majority) before any under-18 marketing claim is made — it is a compliance requirement, not an optional feature.

### 6. International expansion
- Each new country requires its own KYC/AML review, tax treaty consideration, and local securities regulator engagement before non-US users can trade US securities.
- Planned as a phased, country-by-country rollout after the US product is validated — not a simultaneous global launch.

### 7. Data flywheel (future)
- Aggregated, anonymized screening and usage data (which funds get screened, where users hesitate, which criteria fail most often) can inform new product research over time.
- Any use of user data for research needs an explicit opt-in and a clear privacy policy — this is a "next" item, not a v1 assumption.

---

## What's next / the ask

- Brokerage partner integration to move from simulated to real trade execution.
- Custodial account flow to responsibly serve investors under 18.
- Support building the research pipeline referenced above, once the opt-in data policy is in place.

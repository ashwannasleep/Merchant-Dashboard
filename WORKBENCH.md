# Replenishment workspace

The landing page now computes a budget-aware purchase draft from inventory rather than displaying hard-coded KPI values. The other routes retain the original inventory, analytics, velocity and conflict demos.

Import CSV with `sku,title,stock,daily_sales,unit_cost` (up to 10,000 rows / 2 MB). SKUs must be unique; stock must be a nonnegative integer; daily sales nonnegative; unit cost positive. Quoted commas, doubled quotes, BOM and CRLF are accepted. Invalid imports leave the last valid dataset untouched. Imports remain in memory in this page; they are not uploaded or persisted and do not replace the sample data on the other routes.

Change lead time, safety coverage, demand multiplier and budget. The queue ranks by stock coverage and funds whole units up to budget, using integer cents. Download a filtered draft with both needed and funded quantities; CSV formula-leading values are escaped. This is a transparent greedy allocation rule, not a profit optimizer. No purchase orders are placed.

Run a standalone browser demo: `VITE_STATIC_MODE=true npm exec vite -- --host 127.0.0.1 --port 5175`. Run checks: `npm run check` and `node --import tsx --test client/src/lib/replenishment.test.ts`.

Amazon SP-API is **not connected**. A real integration requires the owner's seller authorization and application registration. This CSV workflow is usable without those credentials. A future connector must add server-side OAuth token handling, marketplace mapping, pagination and throttling, and reconcile source data before enabling writes.

# Status

Last updated: 2026-04-27
Milestone: v1.5.x stabilization and velocity cleanup

## Now (current focus)

- Stabilize and simplify local development workflow around a single server (`3000`).
- Keep UI/layout improvements while reducing project overhead.
- Prevent regressions in core loop (roll -> score -> cashout/shop).

## Done Recently

- Purged large legacy/archive/process files to reduce project weight.
- Standardized guidance toward default dev server on `3000`.
- Kept core runtime/dev structure (`game`, `scripts`, `tools`, `tests`, config files).

## Risks / Watchlist

- E2E long-run stability can be sensitive to web server lifecycle.
- Large in-flight UI/layout changes need focused smoke checks.
- Missing documentation drift risk after hard purge; capture only essential decisions.

## Evidence Snapshot

- Unit tests most recently observed passing: `18/18`.
- Build was observed passing in earlier session.
- Full boon E2E rerun intentionally deferred.


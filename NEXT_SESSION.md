# Next Session

## First Task (do this first)

Validate clean boot + core loop smoke on the simplified project baseline.

## Success Criteria

- Dev server starts cleanly on `3000`.
- Game opens and reaches playable state.
- One full loop works: roll -> score -> proceed toward shop/cashout transition.
- No obvious blocker introduced by purge/simplification.

## Commands

```bash
npm install
npm run dev
npm run test
```

Optional after baseline is healthy:

```bash
npm run build
```

## If Blocked

- If startup fails, fix boot/runtime issue first (highest priority).
- If test fails, fix regression before any new feature work.
- If only E2E is flaky, record issue in `STATUS.md` and continue with targeted stability task.

## On Session End (mandatory)

1. Update `STATUS.md` with what moved.
2. Add/adjust key decision in `DECISIONS.md`.
3. Replace this file with the next concrete first task.


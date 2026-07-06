# Engine Module

The Engine class and core plumbing — slice adoption, configuration, and dispatch abstraction — live here.

## What Belongs Here vs. `utils/`

- **Here**: Code that is intrinsic to the Engine lifecycle — store creation, slice adoption, dispatch wiring, configuration validation.
- **`utils/`**: General-purpose helpers (memoization, ID generation, selector utilities) that happen to be used by the engine but are not engine-specific.

## Adding Code

If your change relates to how the engine bootstraps, manages slices, or dispatches actions, place it here. Export new symbols from `index.ts`.

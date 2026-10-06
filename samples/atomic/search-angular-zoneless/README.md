# Atomic Search with zoneless Angular

This sample runs Coveo Atomic in an Angular application that doesn't load zone.js and bootstraps with `provideZonelessChangeDetection()`.

It renders the same search page in two ways, so the behavior of the `@coveo/atomic-angular` wrapper can be compared with plain Atomic custom elements:

- `/wrapper`: the `@coveo/atomic-angular` components, through `AtomicAngularModule`.
- `/custom-elements`: the Atomic custom elements, registered with `defineCustomElements` from `@coveo/atomic/loader` and used with `CUSTOM_ELEMENTS_SCHEMA`.

Both pages:

- Bind Atomic inputs to signals (`language`, `mobileBreakpoint` and a facet `label`).
- Listen to the `atomic-layout-breakpoint-change` event, both with a template event binding and with an observable subscription.
- Show the total number of results from a Headless controller subscription, stored in a signal.

## Zoneless guidelines

Without zone.js, Angular refreshes a view when a signal it reads changes, when a template event listener runs, or when `markForCheck()` is called. Callbacks that Angular doesn't own, such as Headless controller subscriptions, `addEventListener` and observable subscriptions, must write to signals (or call `markForCheck()`) for the view to update.

## Getting started

From the repository root, build the packages, then start the sample:

```bash
pnpm run build
cd samples/atomic/search-angular-zoneless
pnpm run dev
```

Open `http://localhost:4300/`.

## Available scripts

```bash
pnpm run dev    # Copy the Atomic assets and start the development server
pnpm run build  # Build for production (outputs to dist/)
pnpm run e2e    # Run the Playwright tests
```

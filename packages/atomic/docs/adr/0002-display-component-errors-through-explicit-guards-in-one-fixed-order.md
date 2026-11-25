---
status: Proposed
date: 2026-11-25
related:
  - https://coveord.atlassian.net/browse/KIT-5099
  - https://coveord.atlassian.net/browse/KIT-5197
  - https://github.com/coveo/ui-kit/pull/8943
  - ./0002-annex-walkthrough.md
---

# Display component errors through explicit guards in one fixed order

## Context and Problem Statement

In Stencil, one decorator fetched the bindings, held the component error, and decided what to render while waiting. The Lit migration split it into small decorators. Each component now assembles three pieces by hand:

- a `@state() public error!: Error` declaration;
- `@bindingGuard()` on `render()`, which renders nothing until the bindings arrive;
- `@errorGuard()` on `render()`, which renders `atomic-component-error` when `error` is set.

The pieces have drifted. An audit of `src` for KIT-5099 found four problems:

- **The order is split.** Decorators apply bottom-up, so the top one wins. 89 components put `@bindingGuard()` on top and show an error only after the bindings arrive. 35 put `@errorGuard()` on top and show it at once.
- **The type is wrong.** `error!: Error` says an error always exists, while it is `undefined` unless something failed. Helpers type the host three ways (`Error`, `Error | null`, `error?: Error`), and the prop validator needs two `@ts-expect-error`.
- **Pieces are forgotten.** 9 components can receive an error that nothing displays, plus 2 whose `initialize()` is empty. 6 declare `error` without `@state()`, so a late error does not re-render them.
- **Some failures are silent.** A component with `@bindings()` placed outside an interface renders nothing and logs nothing. An error that no guard displays is not logged either, because only `atomic-component-error` logs.

KIT-5197 makes every prop validation fatal in v4, so every component must display its errors the same way before that lands. The full analysis is linked from KIT-5099, and a prototype is in [#8943](https://github.com/coveo/ui-kit/pull/8943).

## Decision Drivers

- The same mistake gives the same result on every component.
- No error is silent.
- The `error` type says what is true.
- Control flow stays visible in the component file: a reader can tell from it what the component renders on error. This is a team preference, not a hard requirement.
- A validation error that clears itself before the bindings arrive never flashes an error box. Validators run in `hostUpdate`, before the bindings exist, and some props are set after the first update.
- The breaking part fits in the v4 window, before the first v4 prerelease.

## Decision Outcome

Every component that can receive an error declares it and displays it with explicit guards in one fixed order. Final errors are logged where they occur, and a static spec keeps the pattern in place. This is Option G below. It keeps the display rule of Option B, the RFC's proposal, without moving the display out of the component.

### Declaration

Every component that can receive an error declares `@state() public error?: Error`. Optional, because `undefined` means no error. Declared, so it is typed and reactive.

### Guard order

- Where both guards appear, `@bindingGuard()` sits above `@errorGuard()`, so an error displays once the bindings arrive.
- Components without bindings, and the components that render before their bindings arrive, use `@errorGuard()` alone.
- Components that cannot receive an error use no guard.

A component's shape therefore follows from what it uses, and every component that can receive an error declares and displays it the same way.

### Writers

Each writer of `error` clears only an error it set.

### Logging

Final errors are logged where they occur: `initialize()` throwing, a missing interface, and the error box itself. A validation error is not logged when it is set, because it can clear itself before the bindings arrive.

### Missing interface

A component with `@bindings()` placed outside any interface reports `MissingInterfaceParentError` in the console only, once per connection, in v4 too. It does not render the error box, and the error is never written to `error`. This avoids showing a box to visitors when the check is wrong, and it can be changed later by letting `@bindingGuard()` display that error.

### Contract spec

A static spec over `src/components` checks that every component that can receive an error has the declaration and `@errorGuard()`, and that `@bindingGuard()` comes first when present.

### Out of scope

Errors thrown in `render()` stay as they are: the component goes blank and the browser logs the error.

## Consequences

- **Positive:**
  - Every error a component receives is displayed, including on the 9 components whose errors nothing displayed and, once KIT-5197 lands, on `atomic-timeframe` and `atomic-sort-expression`.
  - One guard order wherever both guards appear, and one way to declare and display an error.
  - No silent failure: final errors are logged where they occur.
  - No non-null assertion, no `null` writes, and no `@ts-expect-error` for `error`.
- **Negative:**
  - Each component keeps its error declaration and guards.
  - The contract spec reads source code and must be kept up to date with the decorators.
- **Neutral:**
  - A component outside an interface still renders nothing. It now logs why, once per connection.
  - The public `initializeBindings` and `MissingInterfaceParentError` keep their signatures. `initializeBindings` now also finds an interface through slotted content.

### Breaking in v4

Each change needs a major changeset and an entry in the v3 to v4 upgrade guide.

- **Errors that were swallowed are displayed (step 6).** 9 components start displaying errors they used to swallow, and `atomic-timeframe` and `atomic-sort-expression` follow once every validation is fatal (step 7). A page with a hidden invalid configuration now shows an error box.
- **35 components wait for the interface (step 6).** They show their error once the interface initializes, not at once.
- **`error` becomes optional (step 5).** The published types of every component declare `error?: Error`.

## Implementation and Follow-up

[The annex](./0002-annex-walkthrough.md) shows the effect in code.

Each step is one pull request on `main`. The numbers follow the delivery plan, where step 1 is this ADR.

2. Internal contract `error?: Error`, writers clear only their own error, and a deduplicated `logComponentError` (patch).
3. `@bindings()` returns a subclass with one context consumer per element. It logs `initialize()` errors, and logs a missing interface once per connection with a new parent check that walks the composed tree, slotted content included. `fetchBindings`, exported as `initializeBindings`, uses the same walk, so the check and the fetch cannot disagree. The binding controller keeps its host when the request fails (patch).
4. Drop `InitializeBindingsMixin` from the 12 components that also use `@bindings()`. The mixin marks them initialized before its fetch, so `@bindings()` does nothing on them, and its error handling never clears its own error (patch).
5. v4: `@state() public error?: Error` on every component that can receive an error (major).
6. v4: `@bindingGuard()` above `@errorGuard()` everywhere, guards added where missing, the static contract spec, and the component skill updated (major). The added guards include `atomic-timeframe` and `atomic-sort-expression`. `atomic-sort-expression` also renders `atomic-component-error` by hand when it is outside `atomic-sort-dropdown`; that path moves to `error` and `@errorGuard()`. `atomic-ipx-button` and `atomic-ipx-tabs` have an empty `initialize()` and cannot receive an error in practice, but they use `@bindings()`, so they get the guard for uniformity and the contract spec treats them like every other `@bindings()` component.
7. KIT-5197: every prop validation fatal (major).

Revisit this decision if the contract spec needs a growing list of exemptions or keeps breaking on legitimate refactors. Option B would then be worth a second look.

## Considered Options

### Option A: Make `error` optional, and stop there

- **Summary:** `error?: Error` in the interface and in every component.
- **Pros:** One mechanical change. No behaviour change.
- **Cons:** The split order, the forgotten pieces and the silent failures all stay.

### Option B: `@bindings()` owns the error display

- **Summary:** `@bindings()` returns a subclass that overrides `render()`. It shows the error box once the bindings arrive, and shows a missing-interface error at once. `@errorGuard()` and the `error` declaration leave the components that use `@bindings()`. This is the option the KIT-5099 RFC and [#8943](https://github.com/coveo/ui-kit/pull/8943) propose.
- **Pros:** The error display cannot be forgotten on components with `@bindings()`. The order is decided in one place. It would remove an estimated 330 to 365 lines of boilerplate.
- **Cons:**
  - Of the 136 components with `@bindings()`, 110 would declare nothing and 26 would still declare `error` because they write it. The 24 components without `@bindings()` keep `@errorGuard()`. A component that later starts reading `error` must remember to declare it.
  - The rule "wait for the bindings" lives in two places: the class decorator and `@bindingGuard()`.
  - What a component renders on error is decided outside its file. This reverses the January 2025 choice of small, explicit decorators ([#4891](https://github.com/coveo/ui-kit/pull/4891)).
  - The delivery planned in the RFC is a v3 story with a log-only override, a forward port to `main`, and a v4 story that turns the display on.

### Option C: A mixin or base class owns the error

- **Summary:** Every component extends a class that holds `error`.
- **Pros:** `error` is typed without a declaration in each component.
- **Cons:** A class the component extends sits below its `render()` and cannot wrap it, so the guard stays and extending the class is one more step. A base class drops components from the React and Angular wrappers until both generators change.

### Option D: A reactive controller owns the error

- **Summary:** Each component creates an error controller.
- **Pros:** Composition, the unit Lit recommends.
- **Cons:** A controller cannot change what `render()` returns, so the guard stays and creating the controller is one more step to forget.

### Option E: Keep the three pieces and check them in CI

- **Summary:** A test fails when a component misses a piece.
- **Pros:** No change to how components are written.
- **Cons:** On its own, it keeps the wrong type, the split order and the silent failures.

### Option F: A full error boundary with an event and a production switch

- **Summary:** Catch errors thrown in `render()`, dispatch an event, and allow hiding the box.
- **Pros:** Covers errors thrown in `render()`.
- **Cons:** No integrator has asked for it. Catching a render error makes a failure permanent that the next update would usually fix. It adds public API to design and support.

### Option G (selected): Explicit guards in one fixed order, with logging and a contract check

- **Summary:** described in [Decision Outcome](#decision-outcome).
- **Pros:** A component's shape follows from what it uses. Control flow stays in the component file. The order is already the documented one and the majority one. No error is silent. Most of the work ships as non-breaking fixes.
- **Cons:** Up to three declaration lines stay in each component. A forgotten guard is caught in CI rather than made impossible. The contract spec reads source code and is one more test to maintain.
- **Why G over B:** Both log final errors where they occur, so neither leaves an error silent. The real tradeoff: B makes the error display impossible to forget on components with `@bindings()`, while G makes a forgotten guard a CI failure and keeps the display visible in each component. A CI failure is enough here, because the pieces were mostly forgotten during the migration, which ended in February 2026, and new components start from a generator that already has the guards. For that, G keeps what a component renders readable in its own file, which the team prefers. G keeps B's display rule and the prototype's `@bindings()` subclass, without its `render()` override.
- **Delivery:** G ships as patch fixes on `main` plus two major pull requests. B as planned in the RFC adds a v3 story and a forward port. The difference is moderate and did not decide the outcome.
- **Why G over the others:** A and E each leave part of the problem; G combines them with the fixes that remove the silent failures. C and D keep the guard and add a mandatory step on top of it: extend a class, or create a controller. C also breaks the React and Angular wrappers until their generators change. F adds public API that nobody has asked for.

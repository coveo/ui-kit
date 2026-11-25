---
status: Proposed
date: 2026-11-25
related:
  - https://coveord.atlassian.net/browse/KIT-5099
  - https://coveord.atlassian.net/browse/KIT-5197
  - https://github.com/coveo/ui-kit/pull/8943
---

# Display component errors through explicit guards in one fixed order

## Context and Problem Statement

In Stencil, one decorator fetched the bindings, held the component error, and decided what to render while waiting. The Lit migration split it into small decorators. Each component now assembles three pieces by hand:

- a `@state() public error!: Error` declaration;
- `@bindingGuard()` on `render()`, which renders nothing until the bindings arrive;
- `@errorGuard()` on `render()`, which renders `atomic-component-error` when `error` is set.

The pieces have drifted. An audit of `src` for KIT-5099 found four problems:

- **The order is split.** Decorators apply bottom-up, so the top one wins. 89 components put `@bindingGuard()` on top and show an error only after the bindings arrive. 35 put `@errorGuard()` on top and show it at once.
- **The type is wrong.** `error!: Error` says an error always exists, while it is `undefined` unless something failed. Helpers type the host three ways (`Error`, `Error | null`, `Error | undefined`), and the prop validator needs two `@ts-expect-error`.
- **Pieces are forgotten.** 11 components can receive an error that nothing displays. 6 declare `error` without `@state()`, so a late error does not re-render them.
- **Some failures are silent.** A component with `@bindings()` placed outside an interface renders nothing and logs nothing. An error that no guard displays is not logged either, because only `atomic-component-error` logs.

KIT-5197 makes every prop validation fatal in v4, so every component must display its errors the same way before that lands. The full analysis and a prototype are linked from KIT-5099 and in #8943.

## Decision Drivers

- The same mistake gives the same result on every component.
- No error is silent.
- The `error` type says what is true.
- Every component reads alike, and `render()` shows what renders.
- A validation error that clears itself before the bindings arrive never flashes an error box. Validators run in `hostUpdate`, before the bindings exist, and some props are set after the first update.
- The breaking part fits in the v4 window, before the first v4 prerelease.

## Considered Options

### Option A: Make `error` optional, and stop there

- **Summary:** `error?: Error` in the interface and in every component.
- **Pros:** One mechanical change. No behaviour change.
- **Cons:** The split order, the forgotten pieces and the silent failures all stay.

### Option B: `@bindings()` owns the error display

- **Summary:** `@bindings()` returns a subclass that overrides `render()`. It shows the error box once the bindings arrive, and shows a missing-interface error at once. `@errorGuard()` and the `error` declaration leave the components that use `@bindings()`. This is the option the KIT-5099 RFC and #8943 propose.
- **Pros:** The error display cannot be forgotten on components with `@bindings()`. The order is decided in one place. It removes about 365 lines.
- **Cons:**
  - Components end up in three shapes: 109 declare nothing, 26 still declare `error`, and 24 without `@bindings()` keep `@errorGuard()`. `error` is still set at runtime on all of them, but untyped on 109.
  - The rule "wait for the bindings" lives in two places: the class decorator and `@bindingGuard()`.
  - `render()` no longer shows what renders. This reverses the December 2024 choice of small decorators.
  - The delivery needs a v3 story with a log-only override, a forward port, and a v4 story that turns display on.

### Option C: A mixin or base class owns the error

- **Summary:** Every component extends a class that holds `error`.
- **Pros:** `error` is typed without a declaration in each component.
- **Cons:** A class the component extends sits below its `render()` and cannot wrap it. Extending it is a new step to forget. A base class drops components from the React and Angular wrappers until both generators change.

### Option D: A reactive controller owns the error

- **Summary:** Each component creates an error controller.
- **Pros:** Composition, the unit Lit recommends.
- **Cons:** A controller cannot change what `render()` returns, so the guard stays and can still be forgotten. Every component has to create the controller.

### Option E: Keep the three pieces and check them in CI

- **Summary:** A test fails when a component misses a piece.
- **Pros:** No change to how components are written.
- **Cons:** On its own, it keeps the wrong type, the split order and the silent failures.

### Option F: A full error boundary with an event and a production switch

- **Summary:** Catch errors thrown in `render()`, dispatch an event, and allow hiding the box.
- **Pros:** Covers errors thrown in `render()`.
- **Cons:** No customer has asked for it. Catching a render error makes a failure permanent that the next update would usually fix. It adds public API to design and support.

### Option G: Explicit guards in one fixed order, with logging and a contract check

- **Summary:**
  - Every component that can receive an error declares `@state() public error?: Error`.
  - `@bindingGuard()` always sits above `@errorGuard()`, so an error displays once the bindings arrive. Components without bindings, and the components that render before their bindings arrive, keep `@errorGuard()` alone.
  - Each writer clears only an error it set.
  - Final errors are logged once where they occur: `initialize()` throwing, a missing interface, and the error box itself.
  - A static spec checks the declaration, the guards and their order.
- **Pros:** Every component has the same shape, and `render()` shows what renders. The order is already the documented one and the majority one. No error is silent. Most of the work ships as non-breaking fixes.
- **Cons:** Two declaration lines stay in each component. The contract spec reads source code and is one more test to maintain. A forgotten guard is caught in CI rather than made impossible.

## Decision Outcome

Choose Option G.

### Rationale

- **Against B.** B's main argument is that error display cannot be forgotten. That matters less once final errors are logged at the source: a forgotten guard then costs a missing box, not a silent failure, and the contract spec catches it in CI. The pieces were mostly forgotten during the migration, which ended in February 2026. In exchange, B gives up components that read alike and a `render()` that shows what renders, and it needs a heavier delivery.
- **What G keeps from B.** It keeps B's display rule: an error shows once the bindings arrive. It also keeps the prototype's `@bindings()` subclass, without its `render()` override. The subclass creates one context consumer per element instead of one per connection.
- **Against A and E.** Each one alone leaves part of the problem. G combines them with the fixes that remove the silent failures.
- **Against C, D and F.** They either still need a guard or add public API with no request behind it.

### Sub-decisions

- **`error?: Error`, declared on every component.** Optional, because `undefined` means no error. Declared, so it is typed and reactive everywhere.
- **Missing interface: console only, in v4 too.** A component with `@bindings()` outside any interface logs `MissingInterfaceParentError` once per connection. The error lives in a private slot, not in `error`, so it cannot clobber or be clobbered by another writer. It clears when the bindings arrive. The parent check follows the composed tree, including `assignedSlot`, so a component slotted into an interface inside another shadow root is not reported.
- **The 12 components on both `InitializeBindingsMixin` and `@bindings()` drop the mixin.** The mixin marks them initialized before its fetch, so `@bindings()` does nothing on them. Its error handling overwrites the controller's host and never clears its own error.
- **Errors thrown in `render()` are out of scope.** They stay as they are: the component goes blank and the browser logs the error.

## Consequences

- **Positive:**
  - One shape and one order on every component.
  - No silent failure: final errors are logged once.
  - No non-null assertion, no `null` writes, and no `@ts-expect-error` for `error`.
  - KIT-5197 can make every validation fatal safely.
- **Negative:**
  - In v4, the 11 components whose errors nobody displayed now show the error box.
  - In v4, the 35 components that showed an error at once now wait for the interface to initialize.
  - In v4, `error` becomes optional in the published types of every component.
  - Each component keeps two lines of error boilerplate.
- **Neutral:**
  - A component outside an interface still renders nothing. It now logs why.
  - The public `initializeBindings` and `MissingInterfaceParentError` keep their signatures.

## Implementation and Follow-up

Each step is one pull request on `main`:

1. Internal contract `error?: Error`, writers clear only their own error, and a deduplicated `logComponentError` (patch).
2. `@bindings()` returns a subclass with one context consumer, logs `initialize()` errors and a missing interface, and the binding controller keeps its host when the request fails (patch).
3. Drop `InitializeBindingsMixin` from the 12 components that also use `@bindings()` (patch).
4. v4: `@state() public error?: Error` on every component (major).
5. v4: `@bindingGuard()` above `@errorGuard()` everywhere, guards added where missing, the static contract spec, and the component skill updated (major).
6. KIT-5197: every prop validation fatal (major).

Revisit this decision if guards keep getting forgotten despite the contract spec. Option B would then be worth a second look.

## Annex: walkthrough

Illustrative code showing what the decision looks like. The pull requests above set the final names and details.

### A component with bindings

Before, `atomic-commerce-pager` already had the chosen order, but `error` said it always exists:

```ts
@state() public error!: Error;
```

About 35 other components put the guards the other way round and show an error before their bindings arrive:

```ts
@errorGuard()
@bindingGuard()
render() {}
```

After, every component with bindings reads the same:

```ts
@customElement('atomic-commerce-pager')
@bindings()
@withTailwindStyles
export class AtomicCommercePager
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() public bindings!: CommerceBindings;
  @state() public error?: Error;

  @bindingGuard()
  @errorGuard()
  render() {}
}
```

### A component without bindings, or one that renders before its bindings arrive

```ts
@state() public error?: Error;

@errorGuard()
render() {}
```

### A writer clears only its own error

```ts
private clearError() {
  if (this.host.error === this.lastValidationError) {
    this.host.error = undefined;
  }
  this.lastValidationError = undefined;
}
```

The item context controller follows the same rule with the `MissingParentError` it set.

### The `@bindings()` subclass

```ts
const missingInterfaceError = Symbol('missingInterfaceError');

export function bindings() {
  return <T extends Constructor<BindingsHost>>(Base: T): T =>
    class extends Base {
      [missingInterfaceError]?: MissingInterfaceParentError;

      #consumer = new ContextConsumer(this, {
        context: bindingsContext,
        callback: (value) => receiveBindings(this, value),
        subscribe: true,
      });

      connectedCallback() {
        super.connectedCallback();
        if (!this.bindings && !findInterfaceParent(this)) {
          this[missingInterfaceError] = new MissingInterfaceParentError(this.localName);
          logComponentError(this[missingInterfaceError], this);
        }
      }

      disconnectedCallback() {
        this.unsubscribeLanguage?.();
        super.disconnectedCallback();
      }
    };
}

function receiveBindings(host: BindingsElement, value: AnyBindings) {
  host[missingInterfaceError] = undefined;
  try {
    host.initialize?.();
  } catch (error) {
    host.error = error as Error;
    logComponentError(host.error, host);
  }
}
```

The consumer is a class field, so it is created once per element, after the component's own controllers. `findInterfaceParent` walks the composed tree through `assignedSlot`, `parentNode` and shadow hosts. The subclass does not override `render()`. `receiveBindings` keeps today's checks and its `languageChanged` subscription, left out here.

### What a developer sees

A component placed outside an interface logs once per connection and renders nothing:

```text
Error: The "atomic-commerce-pager" element must be the child of the following elements: atomic-recs-interface, atomic-search-interface, atomic-commerce-interface, … <atomic-commerce-pager>
```

A component that misses a guard, or puts them in the wrong order, fails the contract spec in CI:

```text
atomic-commerce-pager: @bindingGuard() must be above @errorGuard() on render().
atomic-tab: sets `error` but render() has no @errorGuard().
```

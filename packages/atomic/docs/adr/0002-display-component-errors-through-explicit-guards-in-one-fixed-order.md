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

### Option G: Explicit guards in one fixed order, with logging and a contract check

- **Summary:**
  - Every component that can receive an error declares `@state() public error?: Error` and displays it with `@errorGuard()`.
  - Where both guards appear, `@bindingGuard()` sits above `@errorGuard()`, so an error displays once the bindings arrive. Components without bindings, and the components that render before their bindings arrive, use `@errorGuard()` alone. Components that cannot receive an error use no guard.
  - Each writer clears only an error it set.
  - Final errors are logged where they occur: `initialize()` throwing, a missing interface, and the error box itself.
  - A static spec checks the declaration, the guards and their order.
- **Pros:** A component's shape follows from what it uses, and every component that can receive an error declares and displays it the same way. Control flow stays in the component file. The order is already the documented one and the majority one. No error is silent. Most of the work ships as non-breaking fixes.
- **Cons:** Up to three declaration lines stay in each component. A forgotten guard is caught in CI rather than made impossible. The contract spec reads source code and is one more test to maintain.

## Decision Outcome

Choose Option G.

A component with `@bindings()` placed outside any interface reports `MissingInterfaceParentError` in the console only, in v4 too. It does not render the error box. This avoids showing a box to visitors when the check is wrong, and it can be changed later by letting `@bindingGuard()` display that error.

### Rationale

- **G versus B.** Both log final errors where they occur, so neither leaves an error silent. The real tradeoff: B makes the error display impossible to forget on components with `@bindings()`, while G makes a forgotten guard a CI failure and keeps the display visible in each component. A CI failure is enough here, because the pieces were mostly forgotten during the migration, which ended in February 2026, and new components start from a generator that already has the guards. For that, G keeps what a component renders readable in its own file, which the team prefers.
- **What G keeps from B.** It keeps B's display rule: an error shows once the bindings arrive. It also keeps the prototype's `@bindings()` subclass, without its `render()` override.
- **Delivery.** G ships as patch fixes on `main` plus two major pull requests. B as planned in the RFC adds a v3 story and a forward port. The difference is moderate and did not decide the outcome.
- **Against A and E.** Each one alone leaves part of the problem. G combines them with the fixes that remove the silent failures.
- **Against C, D and F.** C and D keep the guard and add a mandatory step on top of it: extend a class, or create a controller. C also breaks the React and Angular wrappers until their generators change. F adds public API that nobody has asked for.

### Scope

- **`error?: Error`, declared on every component that can receive an error.** Optional, because `undefined` means no error. Declared, so it is typed and reactive.
- **Errors thrown in `render()` are out of scope.** They stay as they are: the component goes blank and the browser logs the error.

## Consequences

- **Positive:**
  - One guard order wherever both guards appear, and one way to declare and display an error.
  - No silent failure: final errors are logged where they occur.
  - No non-null assertion, no `null` writes, and no `@ts-expect-error` for `error`.
  - Once KIT-5197 lands, every fatal prop validation error is displayed and logged the same way.
- **Negative:**
  - In v4, the 9 components whose errors nobody displayed, and the 2 with an empty `initialize()`, show the error box when they receive an error.
  - In v4, once KIT-5197 lands, `atomic-timeframe` and `atomic-sort-expression`, which validate without throwing today, show the error box for invalid props. `atomic-sort-expression` also renders `atomic-component-error` by hand when it is outside `atomic-sort-dropdown`; step 6 brings that path under `error` and `@errorGuard()` too.
  - In v4, the 35 components that showed an error at once now wait for the interface to initialize.
  - In v4, `error` becomes optional in the published types of every component.
  - Each component keeps its error declaration and guards.
  - The contract spec reads source code and must be kept up to date with the decorators.
- **Neutral:**
  - A component outside an interface still renders nothing. It now logs why, once per connection.
  - The public `initializeBindings` and `MissingInterfaceParentError` keep their signatures.

## Implementation and Follow-up

Each step is one pull request on `main`. The numbers follow the delivery plan, where step 1 is this ADR.

2. Internal contract `error?: Error`, writers clear only their own error, and a deduplicated `logComponentError` (patch).
3. `@bindings()` returns a subclass with one context consumer per element. It logs `initialize()` errors, and logs a missing interface with a new parent check that also follows slotted content. The binding controller keeps its host when the request fails (patch).
4. Drop `InitializeBindingsMixin` from the 12 components that also use `@bindings()`. The mixin marks them initialized before its fetch, so `@bindings()` does nothing on them, and its error handling never clears its own error (patch).
5. v4: `@state() public error?: Error` on every component that can receive an error (major).
6. v4: `@bindingGuard()` above `@errorGuard()` everywhere, guards added where missing (including `atomic-timeframe` and `atomic-sort-expression`), the static contract spec, and the component skill updated (major).
7. KIT-5197: every prop validation fatal (major).

Revisit this decision if the contract spec needs a growing list of exemptions or keeps breaking on legitimate refactors. Option B would then be worth a second look.

## Annex: walkthrough

Illustrative code showing what the decision looks like. The pull requests above set the final names and details.

### A component with bindings

Before, `atomic-commerce-pager` already had the chosen order, but `error` said it always exists:

```ts
@state() public error!: Error;
```

35 other components put the guards the other way round and show an error before their bindings arrive:

```ts
@errorGuard()
@bindingGuard()
render() {}
```

After, every component with bindings that can receive an error reads the same:

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

The missing-interface error lives in a private symbol rather than in `error`, so it cannot clobber or be clobbered by another writer. The consumer is a class field, so it is created once per element. `findInterfaceParent` is new: unlike today's check, it also follows `assignedSlot`. The subclass does not override `render()`. `receiveBindings` keeps today's checks and its `languageChanged` subscription, left out here.

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

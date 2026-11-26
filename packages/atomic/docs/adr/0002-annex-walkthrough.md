---
related:
  - ./0002-display-component-errors-through-explicit-guards-in-one-fixed-order.md
---

# ADR 0002 annex: walkthrough

This annex shows the effect of [ADR 0002](./0002-display-component-errors-through-explicit-guards-in-one-fixed-order.md) on component code. The snippets are trimmed for reading and illustrative, not a final implementation; the implementation pull requests set the final names and details. Where they and the ADR disagree, the ADR decides.

## A component with bindings

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

## A component without bindings, or one that renders before its bindings arrive

```ts
@state() public error?: Error;

@errorGuard()
render() {}
```

## A writer clears only its own error

```ts
private clearError() {
  if (this.host.error === this.lastValidationError) {
    this.host.error = undefined;
  }
  this.lastValidationError = undefined;
}
```

The item context controller follows the same rule with the `MissingParentError` it set.

## The `@bindings()` subclass

```ts
export function bindings() {
  return <T extends Constructor<BindingsHost>>(Base: T): T =>
    class extends Base {
      #consumer = new ContextConsumer(this, {
        context: bindingsContext,
        callback: (value) => receiveBindings(this, value),
        subscribe: true,
      });

      connectedCallback() {
        super.connectedCallback();
        if (this.initialized && this.bindings && !this.unsubscribeLanguage) {
          subscribeToLanguage(this);
        }
        setTimeout(() => reportMissingInterfaceParent(this));
      }

      disconnectedCallback() {
        this.unsubscribeLanguage?.();
        this.unsubscribeLanguage = undefined;
        super.disconnectedCallback();
      }
    };
}

function reportMissingInterfaceParent(host: BindingsHost) {
  if (!host.isConnected || host.initialized || findInterfaceParent(host)) {
    return;
  }
  logComponentError(new MissingInterfaceParentError(host.localName), host);
}
```

The consumer is a class field, so it is created once per element. The subclass does not override `render()`, and the missing-interface error is never written to `error`. The report waits one task, so a component moved into an interface within the same task is not reported, and a component that already initialized keeps its bindings when it is moved, so it is not reported either. A reconnected component subscribes to `languageChanged` again. `findInterfaceParent` is new: it walks the composed tree, following `assignedSlot`, `parentNode` and shadow hosts. `fetchBindings`, exported as `initializeBindings`, uses the same walk. `receiveBindings` sets the bindings, subscribes to `languageChanged`, calls `initialize()`, and logs an error it throws with `logComponentError`.

## What a developer sees

A component that has not received its bindings and is connected outside an interface logs once per connection and renders nothing:

```text
Error: The "atomic-commerce-pager" element must be the child of the following elements: atomic-recs-interface, atomic-search-interface, atomic-commerce-interface, … <atomic-commerce-pager>
```

A component that misses a guard, or puts them in the wrong order, fails the contract spec in CI:

```text
atomic-commerce-pager: @bindingGuard() must be above @errorGuard() on render().
atomic-tab: can receive `error` but render() has no @errorGuard().
```

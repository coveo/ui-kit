import type {LitElement, ReactiveController} from 'lit';

const shadowSheet = new CSSStyleSheet();
shadowSheet.replaceSync(':host(:state(empty)) { display: none }');

const lightSheet = new CSSStyleSheet();
lightSheet.replaceSync(':state(empty) { display: none }');

/**
 * A reactive controller that manages the `:state(empty)` custom state on a host element
 * using `ElementInternals`. When `isEmpty` is `true`, the host is hidden via `display: none`.
 *
 * @cssState empty - Hides the host element when it has no content to display.
 */
export class HiddenStateController implements ReactiveController {
  private internals: ElementInternals;

  constructor(private host: LitElement) {
    this.internals = host.attachInternals();
    this.internals.states.add('empty');
    host.addController(this);
  }

  hostConnected() {
    if (!this.internals) {
      return;
    }

    const root = this.host.shadowRoot;
    if (root) {
      if (shadowSheet && !root.adoptedStyleSheets.includes(shadowSheet)) {
        root.adoptedStyleSheets.push(shadowSheet);
      }
      return;
    }

    const parent = this.host.getRootNode();
    if (
      lightSheet &&
      (parent instanceof Document || parent instanceof ShadowRoot) &&
      !parent.adoptedStyleSheets.includes(lightSheet)
    ) {
      parent.adoptedStyleSheets.push(lightSheet);
    }
  }

  set isEmpty(value: boolean) {
    if (value) {
      this.internals.states.add('empty');
    } else {
      this.internals.states.delete('empty');
    }
  }

  get isEmpty(): boolean {
    return this.internals.states.has('empty');
  }
}

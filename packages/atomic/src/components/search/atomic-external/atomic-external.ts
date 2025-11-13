import {provide} from '@lit/context';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {
  type InitializeEvent,
  isParentReady,
  markParentAsReady,
} from '@/src/utils/init-queue';
import {
  type AtomicInterface,
  initializeEventName,
} from '@/src/utils/initialization-lit-stencil-common-utils';

/**
 * The `atomic-external` component allows components defined outside of the `atomic-search-interface` to initialize.
 *
 * @slot default - The default slot where you can add child components to the interface.
 */
@customElement('atomic-external')
export class AtomicExternal extends ChildrenUpdateCompleteMixin(LitElement) {
  /**
   * The CSS selector that identifies the `atomic-search-interface` component with which to initialize the external components.
   */
  @property({type: String, reflect: true})
  public selector = 'atomic-search-interface';

  /**
   * Represents the bound interface for the AtomicExternal component.
   */
  @property({attribute: false})
  public boundInterface?: AtomicInterface;

  /**
   * The bindings from the parent interface, provided to child components via Lit context.
   */
  @state()
  @provide({context: bindingsContext})
  public bindings: AnyBindings = {} as AnyBindings;

  @state() public error!: Error;

  public async connectedCallback() {
    super.connectedCallback();
    await this.getUpdateComplete();

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.addEventListener(
      'atomic/scrollToTop',
      this.handleScrollToTop as EventListener
    );
    this.#interface?.addEventListener(
      'atomic/parentReady',
      this.handleParentReady as EventListener
    );
    if (isParentReady(this.#interface!)) {
      markParentAsReady(this);
    }
  }
  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.removeEventListener(
      'atomic/scrollToTop',
      this.handleScrollToTop as EventListener
    );
    this.#interface?.removeEventListener(
      'atomic/parentReady',
      this.handleParentReady as EventListener
    );
  }

  private handleInitialization = (event: InitializeEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.#interface?.dispatchEvent(
      buildCustomEvent(initializeEventName, event.detail)
    );
  };

  private handleScrollToTop = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.#interface?.dispatchEvent(
      buildCustomEvent('atomic/scrollToTop', event.detail)
    );
  };

  private handleParentReady = (event: Event) => {
    if (event.target === this.boundInterface) {
      this.bindings = this.#interface?.bindings as AnyBindings;

      markParentAsReady(this);
    }
  };

  get #interface(): AtomicInterface | undefined {
    if (!this.boundInterface) {
      this.boundInterface = document.querySelector(this.selector) ?? undefined;
      if (!this.boundInterface) {
        const error = new Error(
          `Cannot find interface element with selector "${this.selector}"`
        );
        this.error = error;
        return undefined;
      }
    }

    return this.boundInterface!;
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-external': AtomicExternal;
  }
}

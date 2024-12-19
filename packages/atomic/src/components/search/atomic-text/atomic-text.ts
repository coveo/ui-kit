import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  unsafeCSS,
} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {initializeBindings} from '../../../utils/initialization-lit-utils.js';
import {TailwindLitElement} from '../../../utils/tailwind.element.js';
import type {Bindings} from '../atomic-search-interface/interfaces.js';
import styles from './atomic-text.styles.tw.css';

type GenericRender = string | TemplateResult | undefined | null;

/**
 * The `atomic-text` component leverages the I18n translation module through the atomic-search-interface.
 */
@customElement('atomic-text')
export class AtomicText extends TailwindLitElement {
  @state() public bindings!: Bindings;
  @state() public error!: Error;
  protected firstUpdated(_changedProperties: PropertyValues): void {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
    this.setAttribute(renderedAttribute, 'false');
    this.setAttribute(loadedAttribute, 'false');
  }
  #strings = {
    value: () =>
      this.bindings.i18n.t(this.value, {
        count: this.count,
      }),
  };

  static styles: CSSResultGroup = [
    TailwindLitElement.styles,
    css`
      div {
        border: 1px solid red;
        border-radius: var(--atomic-border-radius-xl);
      }
    `,
    unsafeCSS(styles),
  ];

  #unsubscribeLanguageChanged = () => {};

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('bindings')) {
      this.#unsubscribeLanguageChanged();
      const onLanguageChanged = () => this.requestUpdate();
      this.bindings.i18n.on('languageChanged', onLanguageChanged);
      this.#unsubscribeLanguageChanged = () =>
        this.bindings.i18n.off('languageChanged', onLanguageChanged);
      //TODO initialize controller, to keep in mind when generalizing.
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.setAttribute(renderedAttribute, 'false');
    this.setAttribute(loadedAttribute, 'false');
    this.#unsubscribeLanguageChanged();
  }

  /**
   * The string key value.
   */
  @property({reflect: true}) public value!: string;
  /**
   * The count value used for plurals.
   */
  @property({reflect: true}) public count?: number;

  public connectedCallback() {
    super.connectedCallback();

    initializeBindings(this)
      .then((bindings) => {
        this.bindings = bindings;
      })
      .catch((error) => {
        this.error = error;
      });
  }

  @ErrorGuard()
  @BindingGuard()
  @SetRenderedAttribute()
  public render(): GenericRender {
    return html`<div class="bg-primary border p-2 text-xs">
      ${this.#strings.value()}
    </div>`;
  }
}

interface LitElementWithError extends LitElement {
  error?: Error;
}

const renderedAttribute = 'data-atomic-rendered';
const loadedAttribute = 'data-atomic-loaded';

function ErrorGuard<Component extends LitElementWithError>(): (
  target: Component,
  propertyKey: 'render',
  descriptor: TypedPropertyDescriptor<
    () => string | TemplateResult | undefined | null
  >
) => void | TypedPropertyDescriptor<
  () => string | TemplateResult | undefined | null
> {
  return (_target, _propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (this: Component) {
      if (this.error) {
        console.error(this.error, this);
        return html` <div class="text-error">
          <p>
            <b>${this.nodeName.toLowerCase()} component error</b>
          </p>
          <p>Look at the developer console for more information.</p>
        </div>`;
      }
      return originalMethod?.call(this);
    };
    return descriptor;
  };
}

interface LitElementWithBindings extends LitElement {
  bindings?: Bindings;
}

function BindingGuard<Component extends LitElementWithBindings>(): (
  target: Component,
  propertyKey: 'render',
  descriptor: TypedPropertyDescriptor<
    () => string | TemplateResult | undefined | null
  >
) => void | TypedPropertyDescriptor<
  () => string | TemplateResult | undefined | null
> {
  return (_target, _propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (this: Component) {
      this.classList.toggle('atomic-hidden', !this.bindings);
      return this.bindings ? originalMethod?.call(this) : null;
    };
    return descriptor;
  };
}

function SetRenderedAttribute<Component extends LitElementWithBindings>(): (
  target: Component,
  propertyKey: 'render',
  descriptor: TypedPropertyDescriptor<
    () => string | TemplateResult | undefined | null
  >
) => void | TypedPropertyDescriptor<
  () => string | TemplateResult | undefined | null
> {
  return (_target, _propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (this: Component) {
      this.setAttribute(renderedAttribute, 'true');
      descriptor.value = originalMethod;
      return originalMethod?.call(this);
    };
    return descriptor;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-text': AtomicText;
  }
}

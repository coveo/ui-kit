import {InitializeEvent} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import type {CommerceEngine} from '@coveo/headless/commerce';
import {type i18n} from 'i18next';
import {LitElement, nothing, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {CommerceBindings} from '../../../src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import type {BaseAtomicInterface} from '../../../src/components/common/interface/interface-common.js';
import {createTestI18n} from '../i18n-utils.js';

@customElement('atomic-commerce-interface')
export class FixtureAtomicCommerceInterface
  extends LitElement
  implements BaseAtomicInterface<CommerceEngine>
{
  analytics: boolean = false;
  i18n!: i18n;
  languageAssetsPath: string = './lang';
  iconAssetsPath: string = './assets';
  host: HTMLElement;
  #internalBindings!: Exclude<CommerceBindings, 'i18n'>;
  @state()
  template!: TemplateResult;
  get bindings(): CommerceBindings {
    return {
      ...this.#internalBindings,
      i18n: this.i18n,
    };
  }
  error?: Error | undefined;
  updateIconAssetsPath(): void {
    throw new Error('Method not implemented.');
  }
  registerFieldsToInclude?: (() => void) | undefined;

  @property({reflect: true, type: Boolean})
  get ready() {
    return Boolean(this.i18n && this.bindings);
  }

  constructor() {
    super();
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
    });
    this.host = this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(initializeEventName, (event) => {
      (event as InitializeEvent).detail(this.bindings);
    });
  }

  setBindings(bindings: Partial<CommerceBindings>) {
    this.#internalBindings = bindings as CommerceBindings;
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

// export async function renderInAtomicCommerceInterface<T extends LitElement> (
//   template: TemplateResult, bindings: Partial<CommerceBindings>
// ): Promise<T> {
//     const interfaceElement = await fixture<FixtureAtomicCommerceInterface>(
//         html`<atomic-commerce-interface></atomic-commerce-interface>`
//     );
//     interfaceElement.setBindings(bindings);

// }

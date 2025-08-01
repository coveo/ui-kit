import type {CommerceEngine} from '@coveo/headless/commerce';
import {provide} from '@lit/context';
import type {i18n} from 'i18next';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store.js';
import {bindingsContext} from '@/src/components/context/bindings-context.js';
import {
  type InitializeEvent,
  markParentAsReady,
} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import type {
  AtomicCommerceInterface,
  CommerceBindings,
} from '../../../../../src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import type {BaseAtomicInterface} from '../../../../../src/components/common/interface/interface-common.js';
import {fixture} from '../../../fixture.js';
import {createTestI18n} from '../../../i18n-utils.js';
import {genericSubscribe} from '../../headless/common.js';

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
  @state()
  template!: TemplateResult;
  @provide({context: bindingsContext})
  bindings: CommerceBindings = {} as CommerceBindings;
  error?: Error | undefined;
  updateIconAssetsPath = () => {};
  registerFieldsToInclude?: (() => void) | undefined;

  @property({reflect: true, type: Boolean})
  get ready() {
    return Boolean(this.i18n && this.bindings);
  }

  constructor() {
    super();
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
      markParentAsReady(this);
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
    this.bindings = {
      ...bindings,
      i18n: bindings.i18n ?? this.i18n,
    } as CommerceBindings;
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  interfaceElement: {
    type: 'product-listing',
  } as AtomicCommerceInterface,
  store: {
    state: {
      loadingFlags: [],
    } as Partial<CommerceStore['state']>,
    setLoadingFlag: vi.fn(),
    unsetLoadingFlag: vi.fn(),
    onChange: vi.fn(),
  } as Partial<CommerceStore> as CommerceStore,
  engine: {
    subscribe: genericSubscribe,
  } as Partial<CommerceEngine> as CommerceEngine,
} as const;

defaultBindings satisfies Partial<CommerceBindings>;
type MinimalBindings = Partial<CommerceBindings> & typeof defaultBindings;

export function renderInAtomicCommerceInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<CommerceBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  atomicInterface: FixtureAtomicCommerceInterface;
}>;
export async function renderInAtomicCommerceInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<CommerceBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: null | T;
  atomicInterface: FixtureAtomicCommerceInterface;
}> {
  const atomicInterface = await fixture<FixtureAtomicCommerceInterface>(
    html`<atomic-commerce-interface></atomic-commerce-interface>`
  );
  if (!bindings) {
    atomicInterface.setBindings({} as CommerceBindings);
  }
  if (typeof bindings === 'function') {
    atomicInterface.setBindings(bindings(defaultBindings));
  } else {
    atomicInterface.setBindings(bindings ?? defaultBindings);
  }
  atomicInterface.setRenderTemplate(template);

  await atomicInterface.updateComplete;
  if (!selector) {
    return {element: null, atomicInterface};
  }

  const element = atomicInterface.shadowRoot!.querySelector<T>(selector)!;
  await element.updateComplete;

  return {element, atomicInterface};
}

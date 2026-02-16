import type {SearchEngine} from '@coveo/headless';
import {provide} from '@lit/context';
import type {i18n} from 'i18next';
import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import {bindingsContext} from '@/src/components/common/context/bindings-context.js';
import type {BaseAtomicInterface} from '@/src/components/common/interface/interface-controller.js';
import type {AtomicSearchInterface} from '@/src/components/index.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces.js';
import type {SearchStore} from '@/src/components/search/atomic-search-interface/store.js';
import {
  type InitializeEvent,
  markParentAsReady,
} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils.js';

@customElement('atomic-search-interface')
export class FixtureAtomicSearchInterface
  extends LitElement
  implements BaseAtomicInterface<SearchEngine>
{
  analytics: boolean = false;
  i18n!: i18n;
  languageAssetsPath: string = './lang';
  iconAssetsPath: string = './assets';
  host: HTMLElement;
  @state()
  template!: TemplateResult;
  @provide({context: bindingsContext})
  bindings: Bindings = {} as Bindings;
  error!: Error;
  updateIconAssetsPath = () => {};
  registerFieldsToInclude?: (() => void) | undefined;

  @property({reflect: true, type: Boolean})
  get ready() {
    return Boolean(this.i18n && this.bindings);
  }

  constructor() {
    super();
    // TODO: KIT-4974 - Once all components are migrated from InitializeBindingsMixin to using only the @bindings decorator,
    // we can move markParentAsReady() back here (after i18n is created) instead of in setBindings().
    // The @bindings decorator uses Lit's ContextConsumer which properly waits for non-empty bindings,
    // whereas InitializeBindingsMixin uses the event queue system which has a race condition with setBindings().
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
      // markParentAsReady will be called from setBindings for now
    });
    this.host = this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(initializeEventName, (event) => {
      (event as InitializeEvent).detail(this.bindings);
    });
  }

  setBindings(bindings: Partial<Bindings>) {
    this.bindings = {
      ...bindings,
      i18n: bindings.i18n ?? this.i18n,
      interfaceElement: this as unknown as AtomicSearchInterface,
    } as Bindings;
    // TODO: KIT-4974 - Remove this call once all components use @bindings decorator instead of InitializeBindingsMixin.
    // Mark parent as ready after bindings are set to avoid race condition with components using InitializeBindingsMixin.
    markParentAsReady(this);
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

export const defaultBindings = {
  interfaceElement: {} as AtomicSearchInterface,
  store: {
    state: {
      loadingFlags: [],
    } as Partial<SearchStore['state']>,
    setLoadingFlag: vi.fn(),
    unsetLoadingFlag: vi.fn(),
    onChange: vi.fn(),
  } as Partial<SearchStore> as SearchStore,
  engine: {
    subscribe: genericSubscribe,
    addReducers: vi.fn(),
    dispatch: vi.fn(),
  } as Partial<SearchEngine> as SearchEngine,
} as const;

defaultBindings satisfies Partial<Bindings>;
type MinimalBindings = Partial<Bindings> & typeof defaultBindings;

export function renderInAtomicSearchInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<Bindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  atomicInterface: FixtureAtomicSearchInterface;
}>;
export async function renderInAtomicSearchInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<Bindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: null | T;
  atomicInterface: FixtureAtomicSearchInterface;
}> {
  const atomicInterface = await fixture<FixtureAtomicSearchInterface>(
    html`<atomic-search-interface>${template}</atomic-search-interface>`
  );
  if (!bindings) {
    atomicInterface.setBindings({} as Bindings);
  }
  if (typeof bindings === 'function') {
    atomicInterface.setBindings(bindings(defaultBindings));
  } else {
    atomicInterface.setBindings(bindings ?? defaultBindings);
  }

  await atomicInterface.updateComplete;
  if (!selector) {
    return {element: null, atomicInterface};
  }

  const element = atomicInterface.querySelector<T>(selector)!;
  await element.updateComplete;

  return {element, atomicInterface};
}

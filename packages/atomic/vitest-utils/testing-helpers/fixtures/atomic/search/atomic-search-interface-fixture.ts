import type {SearchEngine} from '@coveo/headless';
import {provide} from '@lit/context';
import type {i18n} from 'i18next';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingsContext} from '@/src/components/context/bindings-context.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces.js';
import type {SearchStore} from '@/src/components/search/atomic-search-interface/store.js';
import {
  type InitializeEvent,
  markParentAsReady,
} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import type {BaseAtomicInterface} from '../../../../../src/components/common/interface/interface-common.js';
import {fixture} from '../../../fixture.js';
import {createTestI18n} from '../../../i18n-utils.js';
import {genericSubscribe} from '../../headless/common.js';

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

  setBindings(bindings: Partial<Bindings>) {
    this.bindings = {
      ...bindings,
      i18n: bindings.i18n ?? this.i18n,
    } as Bindings;
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  store: {
    state: {
      loadingFlags: [],
    } as Partial<SearchEngine['state']>,
  } as Partial<SearchStore> as SearchStore,
  engine: {
    subscribe: genericSubscribe,
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
    html`<atomic-search-interface></atomic-search-interface>`
  );
  if (!bindings) {
    atomicInterface.setBindings({} as Bindings);
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

import type {RecommendationEngine} from '@coveo/headless/recommendation';
import {provide} from '@lit/context';
import type {i18n} from 'i18next';
import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import {bindingsContext} from '@/src/components/common/context/bindings-context.js';
import type {BaseAtomicInterface} from '@/src/components/common/interface/interface-controller.js';
import type {
  AtomicRecsInterface,
  RecsBindings,
} from '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface.js';
import type {RecsStore} from '@/src/components/recommendations/atomic-recs-interface/store.js';
import {
  type InitializeEvent,
  markParentAsReady,
} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils.js';

@customElement('atomic-recs-interface')
export class FixtureAtomicRecsInterface
  extends LitElement
  implements BaseAtomicInterface<RecommendationEngine>
{
  analytics: boolean = false;
  i18n!: i18n;
  languageAssetsPath: string = './lang';
  iconAssetsPath: string = './assets';
  host: HTMLElement;
  @state()
  template!: TemplateResult;
  @provide({context: bindingsContext})
  bindings: RecsBindings = {} as RecsBindings;
  error!: Error;
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

  setBindings(bindings: Partial<RecsBindings>) {
    this.bindings = {
      ...bindings,
      i18n: bindings.i18n ?? this.i18n,
      interfaceElement: this as unknown as AtomicRecsInterface,
    } as RecsBindings;
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

export const defaultBindings = {
  interfaceElement: {} as AtomicRecsInterface,
  store: {
    state: {
      loadingFlags: [],
    } as Partial<RecsStore['state']>,
    setLoadingFlag: vi.fn(),
    unsetLoadingFlag: vi.fn(),
    onChange: vi.fn(),
  } as Partial<RecsStore> as RecsStore,
  engine: {
    subscribe: genericSubscribe,
  } as Partial<RecommendationEngine> as RecommendationEngine,
} as const;

defaultBindings satisfies Partial<RecsBindings>;
type MinimalBindings = Partial<RecsBindings> & typeof defaultBindings;

export function renderInAtomicRecsInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<RecsBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  atomicInterface: FixtureAtomicRecsInterface;
}>;
export async function renderInAtomicRecsInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<RecsBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: null | T;
  atomicInterface: FixtureAtomicRecsInterface;
}> {
  const atomicInterface = await fixture<FixtureAtomicRecsInterface>(
    html`<atomic-recs-interface>${template}</atomic-recs-interface>`
  );
  if (!bindings) {
    atomicInterface.setBindings({} as RecsBindings);
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

  const element = atomicInterface.querySelector<T>(selector)!;
  await element.updateComplete;

  return {element, atomicInterface};
}

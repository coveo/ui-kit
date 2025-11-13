import type {InsightEngine} from '@coveo/headless/insight';
import {provide} from '@lit/context';
import type {i18n} from 'i18next';
import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import {bindingsContext} from '@/src/components/common/context/bindings-context.js';
import type {BaseAtomicInterface} from '@/src/components/common/interface/interface-controller.js';
import type {
  AtomicInsightInterface,
  InsightBindings,
} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface.js';
import type {InsightStore} from '@/src/components/insight/atomic-insight-interface/store.js';
import {
  type InitializeEvent,
  markParentAsReady,
} from '@/src/utils/init-queue.js';
import {initializeEventName} from '@/src/utils/initialization-lit-stencil-common-utils.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils.js';

@customElement('atomic-insight-interface')
export class FixtureAtomicInsightInterface
  extends LitElement
  implements BaseAtomicInterface<InsightEngine>
{
  analytics: boolean = false;
  i18n!: i18n;
  languageAssetsPath: string = './lang';
  iconAssetsPath: string = './assets';
  host: HTMLElement;
  @state()
  template!: TemplateResult;
  @provide({context: bindingsContext})
  bindings: InsightBindings = {} as InsightBindings;
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

  setBindings(bindings: Partial<InsightBindings>) {
    this.bindings = {
      ...bindings,
      i18n: bindings.i18n ?? this.i18n,
      interfaceElement: this as unknown as AtomicInsightInterface,
    } as InsightBindings;
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

export const defaultBindings = {
  interfaceElement: {} as AtomicInsightInterface,
  store: {
    state: {
      loadingFlags: [],
    } as Partial<InsightStore['state']>,
    setLoadingFlag: vi.fn(),
    unsetLoadingFlag: vi.fn(),
    onChange: vi.fn(),
  } as Partial<InsightStore> as InsightStore,
  engine: {
    subscribe: genericSubscribe,
  } as Partial<InsightEngine> as InsightEngine,
} as const;

defaultBindings satisfies Partial<InsightBindings>;
type MinimalBindings = Partial<InsightBindings> & typeof defaultBindings;

export function renderInAtomicInsightInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  atomicInterface: FixtureAtomicInsightInterface;
}>;
export async function renderInAtomicInsightInterface<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: null | T;
  atomicInterface: FixtureAtomicInsightInterface;
}> {
  const atomicInterface = await fixture<FixtureAtomicInsightInterface>(
    html`<atomic-insight-interface>${template}</atomic-insight-interface>`
  );
  if (!bindings) {
    atomicInterface.setBindings({} as InsightBindings);
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

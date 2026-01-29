import type {
  FoldedResult as InsightFoldedResult,
  FoldedResultList as InsightFoldedResultList,
  FoldedResultListState as InsightFoldedResultListState,
  InteractiveResult as InsightInteractiveResult,
  Result as InsightResult,
} from '@coveo/headless/insight';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {DisplayConfig} from '@/src/components/common/item-list/context/item-display-config-context-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {fixture} from '../../../fixture';
import {
  type FixtureAtomicInsightInterface,
  defaultBindings as insightDefaultBindings,
  renderInAtomicInsightInterface,
} from './atomic-insight-interface-fixture';

/**
 * Test fixture that provides result context to child insight result template components.
 * Mimics the behavior of atomic-insight-result by responding to atomic/resolveResult events.
 */
@customElement('fixture-atomic-insight-result')
@withTailwindStyles
export class FixtureAtomicInsightResult extends LitElement {
  @state() template!: TemplateResult;
  @property({type: Object}) result?: InsightFoldedResult;
  @property({type: Object}) content?: ParentNode;
  @property({type: Object, attribute: 'interactive-result'})
  interactiveResult?: InsightInteractiveResult;
  @property({type: Object, attribute: 'folded-result-list'})
  foldedResultList?: InsightFoldedResultList;
  @property({type: Object, attribute: 'display-config'})
  displayConfig?: DisplayConfig;

  get ready() {
    return Boolean(this.template);
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('atomic/resolveResult', this.handleResolveResult);
    this.addEventListener(
      'atomic/resolveInteractiveResult',
      this.handleResolveInteractiveResult
    );
    this.addEventListener(
      'atomic/resolveFoldedResultList',
      this.handleResolveFoldedResultList
    );
    this.addEventListener(
      'atomic/resolveResultDisplayConfig',
      this.handleResolveResultDisplayConfig
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/resolveResult', this.handleResolveResult);
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.handleResolveInteractiveResult
    );
    this.removeEventListener(
      'atomic/resolveFoldedResultList',
      this.handleResolveFoldedResultList
    );
    this.removeEventListener(
      'atomic/resolveResultDisplayConfig',
      this.handleResolveResultDisplayConfig
    );
  }

  private handleResolveResult = (event: Event) => {
    const customEvent = event as CustomEvent<
      (result: Record<string, unknown>) => void
    >;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.result && typeof customEvent.detail === 'function') {
      customEvent.detail(this.result as unknown as Record<string, unknown>);
    }
  };

  private handleResolveInteractiveResult = (event: Event) => {
    const customEvent = event as CustomEvent<
      (interactiveResult: Record<string, unknown>) => void
    >;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.interactiveResult && typeof customEvent.detail === 'function') {
      customEvent.detail(
        this.interactiveResult as unknown as Record<string, unknown>
      );
    }
  };

  private handleResolveFoldedResultList = (event: Event) => {
    const customEvent = event as CustomEvent<
      (foldedResultList: InsightFoldedResultList) => void
    >;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.foldedResultList && typeof customEvent.detail === 'function') {
      customEvent.detail(this.foldedResultList);
    }
  };

  private handleResolveResultDisplayConfig = (event: Event) => {
    const customEvent = event as CustomEvent<
      (displayConfig: DisplayConfig) => void
    >;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    if (this.displayConfig && typeof customEvent.detail === 'function') {
      customEvent.detail(this.displayConfig);
    }
  };

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  ...insightDefaultBindings,
} as const;

defaultBindings satisfies Partial<InsightBindings>;
type MinimalBindings = Partial<InsightBindings> & typeof defaultBindings;

/**
 * Builds a mock InsightFoldedResult for testing.
 */
export function buildMockInsightFoldedResult(
  overrides: Partial<InsightFoldedResult> & {
    uniqueId?: string;
    title?: string;
    children?: InsightFoldedResult[];
  } = {}
): InsightFoldedResult {
  const result: InsightResult = {
    title: overrides.title ?? 'Mock Result',
    uri: 'https://example.com',
    printableUri: 'https://example.com',
    clickUri: 'https://example.com',
    uniqueId: overrides.uniqueId ?? 'mock-result-id',
    excerpt: 'Mock excerpt',
    firstSentences: 'Mock first sentences',
    summary: null,
    flags: '',
    hasHtmlVersion: false,
    score: 100,
    percentScore: 100,
    rating: 0,
    isTopResult: false,
    isRecommendation: false,
    titleHighlights: [],
    firstSentencesHighlights: [],
    excerptHighlights: [],
    printableUriHighlights: [],
    summaryHighlights: [],
    absentTerms: [],
    raw: {
      urihash: 'mock-hash',
      parents: '',
      sfid: '',
      sfparentid: '',
      sfinsertedbyid: '',
      sysurihash: 'mock-sys-hash',
      sysuri: 'https://example.com',
      sysclickableuri: 'https://example.com',
      sysindexeddate: Date.now(),
      ...overrides.result?.raw,
    },
    ...overrides.result,
  };

  return {
    result,
    children: overrides.children ?? [],
    ...overrides,
  };
}

/**
 * Builds a mock InsightFoldedResultList controller for testing.
 */
export function buildMockInsightFoldedResultList(
  results: InsightFoldedResult[] = []
): InsightFoldedResultList {
  const state: InsightFoldedResultListState = {
    results,
    isLoading: false,
    hasError: false,
    searchResponseId: 'mock-search-response-id',
  };

  return {
    state,
    subscribe: (listener: () => void) => {
      listener();
      return () => {};
    },
    loadCollection: () => {},
    logShowMoreFoldedResults: () => {},
    logShowLessFoldedResults: () => {},
  } as unknown as InsightFoldedResultList;
}

/**
 * Builds a default DisplayConfig for testing.
 */
export function buildMockDisplayConfig(
  overrides: Partial<DisplayConfig> = {}
): DisplayConfig {
  return {
    density: 'normal',
    imageSize: 'small',
    ...overrides,
  };
}

/**
 * Renders a component within a fixture-atomic-insight-result wrapper for testing insight result template components.
 *
 * @example
 * ```typescript
 * const {element} = await renderInAtomicInsightResult<AtomicInsightResultChildren>({
 *   template: html`<atomic-insight-result-children></atomic-insight-result-children>`,
 *   selector: 'atomic-insight-result-children',
 *   result: buildMockInsightFoldedResult({children: [childResult]}),
 *   foldedResultList: buildMockInsightFoldedResultList([parentResult]),
 *   bindings: (bindings) => {
 *     bindings.engine = mockedEngine;
 *     return bindings;
 *   },
 * });
 * ```
 */
export function renderInAtomicInsightResult<T extends LitElement>({
  template,
  selector,
  bindings,
  result,
  interactiveResult,
  foldedResultList,
  displayConfig,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: InsightFoldedResult;
  interactiveResult?: InsightInteractiveResult;
  foldedResultList?: InsightFoldedResultList;
  displayConfig?: DisplayConfig;
}): Promise<{
  element: T;
  atomicResult: FixtureAtomicInsightResult;
  atomicInterface: FixtureAtomicInsightInterface;
}>;

export async function renderInAtomicInsightResult<T extends LitElement>({
  template,
  selector,
  bindings,
  result,
  interactiveResult,
  foldedResultList,
  displayConfig,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: InsightFoldedResult;
  interactiveResult?: InsightInteractiveResult;
  foldedResultList?: InsightFoldedResultList;
  displayConfig?: DisplayConfig;
}): Promise<{
  element: null | T;
  atomicResult: FixtureAtomicInsightResult;
  atomicInterface: FixtureAtomicInsightInterface;
}> {
  const atomicResult = await fixture<FixtureAtomicInsightResult>(
    html`<fixture-atomic-insight-result
      .result=${result}
      .interactiveResult=${interactiveResult}
      .foldedResultList=${foldedResultList}
      .displayConfig=${displayConfig ?? buildMockDisplayConfig()}
    ></fixture-atomic-insight-result>`
  );

  atomicResult.setRenderTemplate(template);

  const resultTemplate = html`${atomicResult}`;
  const {atomicInterface} = await renderInAtomicInsightInterface({
    template: resultTemplate,
    bindings,
  });

  await atomicResult.updateComplete;
  await atomicInterface.updateComplete;

  if (!selector) {
    return {element: null, atomicResult, atomicInterface};
  }

  const element = atomicResult.shadowRoot!.querySelector<T>(selector)!;
  await element?.updateComplete;

  return {element, atomicResult, atomicInterface};
}

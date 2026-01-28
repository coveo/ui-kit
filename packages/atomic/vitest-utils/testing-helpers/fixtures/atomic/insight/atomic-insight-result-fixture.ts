import type {Result} from '@coveo/headless/insight';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {fixture} from '../../../fixture.js';
import {
  type FixtureAtomicInsightInterface,
  defaultBindings as insightDefaultBindings,
  renderInAtomicInsightInterface,
} from './atomic-insight-interface-fixture.js';

/**
 * Test fixture that provides result context to child result template components.
 * Mimics the behavior of atomic-insight-result by responding to atomic/resolveResult events.
 */
@customElement('atomic-insight-result')
@withTailwindStyles
export class FixtureAtomicInsightResult extends LitElement {
  @state() template!: TemplateResult;
  @property({type: Object}) result?: Result;
  @property({type: Object}) content?: ParentNode;

  get ready() {
    return Boolean(this.template);
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('atomic/resolveResult', this.handleResolveResult);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/resolveResult', this.handleResolveResult);
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
 * Renders a component within an atomic-insight-result wrapper for testing result template components.
 *
 * @example
 * ```typescript
 * const {element} = await renderInAtomicInsightResult<AtomicInsightResultAttachToCaseAction>({
 *   template: html`<atomic-insight-result-attach-to-case-action></atomic-insight-result-attach-to-case-action>`,
 *   selector: 'atomic-insight-result-attach-to-case-action',
 *   result: mockResult,
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
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: Result;
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
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<InsightBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: Result;
}): Promise<{
  element: null | T;
  atomicResult: FixtureAtomicInsightResult;
  atomicInterface: FixtureAtomicInsightInterface;
}> {
  const atomicResult = await fixture<FixtureAtomicInsightResult>(
    html`<atomic-insight-result .result=${result}></atomic-insight-result>`
  );

  atomicResult.setRenderTemplate(template);

  const resultTemplate = html`${atomicResult}`;
  const {atomicInterface} = await renderInAtomicInsightInterface({
    template: resultTemplate,
    bindings,
  });

  await atomicInterface.updateComplete;
  await atomicResult.updateComplete;

  if (!selector) {
    return {element: null, atomicResult, atomicInterface};
  }

  const element = atomicResult.querySelector<T>(selector)!;
  await element.updateComplete;

  return {element, atomicResult, atomicInterface};
}

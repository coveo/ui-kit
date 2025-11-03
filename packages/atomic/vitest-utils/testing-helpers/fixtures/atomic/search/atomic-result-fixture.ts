import type {InteractiveResult, Result} from '@coveo/headless';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {fixture} from '../../../fixture.js';
import {
  type FixtureAtomicSearchInterface,
  renderInAtomicSearchInterface,
  defaultBindings as searchDefaultBindings,
} from './atomic-search-interface-fixture.js';
/**
 * Test fixture that provides result context to child result template components.
 * Mimics the behavior of atomic-result by responding to atomic/resolveResult events.
 */
@customElement('atomic-result')
@withTailwindStyles
export class FixtureAtomicResult extends LitElement {
  @state() template!: TemplateResult;
  @property({type: Object}) result?: Result;
  @property({type: Object}) content?: ParentNode;
  @property({type: Object, attribute: 'interactive-result'})
  interactiveResult?: InteractiveResult;

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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/resolveResult', this.handleResolveResult);
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.handleResolveInteractiveResult
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

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  ...searchDefaultBindings,
} as const;

defaultBindings satisfies Partial<Bindings>;
type MinimalBindings = Partial<Bindings> & typeof defaultBindings;

/**
 * Renders a component within an atomic-result wrapper for testing result template components.
 *
 * @example
 * ```typescript
 * const {element} = await renderInAtomicResult<AtomicResultNumber>({
 *   template: html`<atomic-result-number field="size"></atomic-result-number>`,
 *   selector: 'atomic-result-number',
 *   result: mockResult,
 *   bindings: (bindings) => {
 *     bindings.engine = mockedEngine;
 *     return bindings;
 *   },
 * });
 * ```
 */
export function renderInAtomicResult<T extends LitElement>({
  template,
  selector,
  bindings,
  result,
  interactiveResult,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<Bindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: Result;
  interactiveResult?: InteractiveResult;
}): Promise<{
  element: T;
  atomicResult: FixtureAtomicResult;
  atomicInterface: FixtureAtomicSearchInterface;
}>;

export async function renderInAtomicResult<T extends LitElement>({
  template,
  selector,
  bindings,
  result,
  interactiveResult,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<Bindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  result?: Result;
  interactiveResult?: InteractiveResult;
}): Promise<{
  element: null | T;
  atomicResult: FixtureAtomicResult;
  atomicInterface: FixtureAtomicSearchInterface;
}> {
  const atomicResult = await fixture<FixtureAtomicResult>(
    html`<atomic-result .result=${result} .interactiveResult=${interactiveResult}></atomic-result>`
  );

  atomicResult.setRenderTemplate(template);

  const resultTemplate = html`${atomicResult}`;
  const {atomicInterface} = await renderInAtomicSearchInterface({
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

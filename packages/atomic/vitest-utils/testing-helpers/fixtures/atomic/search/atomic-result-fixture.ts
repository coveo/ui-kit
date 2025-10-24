import type {InteractiveResult, Result} from '@coveo/headless';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {Bindings} from '../../../../../src/components/search/atomic-search-interface/atomic-search-interface.js';
import {fixture} from '../../../fixture.js';
import {
  defaultBindings as commerceDefaultBindings,
  type FixtureAtomicSearchInterface,
  renderInAtomicSearchInterface,
} from './atomic-search-interface-fixture.js';

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
    this.addEventListener('atomic/resolveResult', this.resolveResult);
    this.addEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/resolveResult', this.resolveResult);
    this.removeEventListener(
      'atomic/resolveInteractiveResult',
      this.resolveInteractiveResult
    );
  }

  private resolveResult = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.result && typeof event.detail === 'function') {
      event.detail(this.result);
    }
  };

  private resolveInteractiveResult = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.interactiveResult && typeof event.detail === 'function') {
      event.detail(this.interactiveResult);
    }
  };

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  ...commerceDefaultBindings,
} as const;

defaultBindings satisfies Partial<Bindings>;
type MinimalBindings = Partial<Bindings> & typeof defaultBindings;

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

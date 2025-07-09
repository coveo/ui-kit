import type {i18n} from 'i18next';
import {html, LitElement, nothing, render, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import type {CommerceBindings} from '@/src/index.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

@customElement('atomic-commerce-product-list')
export class FixtureAtomicCommerceProductList extends LitElement {
  i18n!: i18n;
  #internalBindings!: {};
  @state()
  template!: TemplateResult;
  get bindings() {
    return {
      ...this.#internalBindings,
      i18n: this.i18n,
    };
  }

  set bindings(bindings: Partial<CommerceBindings>) {
    this.#internalBindings = bindings as CommerceBindings;
  }

  @property({reflect: true, type: Boolean})
  get ready() {
    return Boolean(this.i18n && this.bindings);
  }

  constructor() {
    super();
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
    });
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  render() {
    const container = document.createElement('div');
    render(this.template, container);

    return this.ready
      ? this.replaceChildren(container.firstElementChild!)
      : nothing;
  }
}

export const defaultBindings = {
  engine: {
    dispatch: vi.fn(),
  } as unknown as CommerceBindings['engine'],
};

defaultBindings satisfies Partial<CommerceBindings>;
type MinimalBindings = Partial<CommerceBindings> & typeof defaultBindings;

export async function renderInAtomicCommerceProductList<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector: string;
  bindings?:
    | Partial<CommerceBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  productList: FixtureAtomicCommerceProductList;
}> {
  const productList = await fixture<FixtureAtomicCommerceProductList>(
    html`<atomic-commerce-product-list></atomic-commerce-product-list>`
  );

  if (typeof bindings === 'function') {
    productList.bindings = bindings(defaultBindings);
  } else {
    productList.bindings = {...defaultBindings, ...bindings};
  }
  productList.setRenderTemplate(template);

  await productList.updateComplete;

  const element = productList!.querySelector<T>(selector)!;
  return {element, productList};
}

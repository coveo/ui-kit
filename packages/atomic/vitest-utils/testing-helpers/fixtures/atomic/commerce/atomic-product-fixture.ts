import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {CommerceBindings} from '../../../../../src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import {fixture} from '../../../fixture.js';
import {
  defaultBindings as commerceDefaultBindings,
  type FixtureAtomicCommerceInterface,
  renderInAtomicCommerceInterface,
} from './atomic-commerce-interface-fixture.js';

@customElement('atomic-product')
export class FixtureAtomicProduct extends LitElement {
  @state() template!: TemplateResult;
  @property({type: Object}) product?: Product;
  @property({type: Object}) content?: ParentNode;

  get ready() {
    return Boolean(this.template);
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('atomic/resolveResult', this.resolveProduct);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/resolveResult', this.resolveProduct);
  }

  private resolveProduct = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.product && typeof event.detail === 'function') {
      event.detail(this.product);
    }
  };

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  ...commerceDefaultBindings,
} as const;

defaultBindings satisfies Partial<CommerceBindings>;
type MinimalBindings = Partial<CommerceBindings> & typeof defaultBindings;

export function renderInAtomicProduct<T extends LitElement>({
  template,
  selector,
  bindings,
  product,
}: {
  template: TemplateResult;
  selector?: string;
  bindings?:
    | Partial<CommerceBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  product?: Product;
}): Promise<{
  element: T;
  atomicProduct: FixtureAtomicProduct;
  atomicInterface: FixtureAtomicCommerceInterface;
}>;

export async function renderInAtomicProduct<T extends LitElement>({
  template,
  selector,
  bindings,
  product,
}: {
  template: TemplateResult;
  selector?: string | never;
  bindings?:
    | Partial<CommerceBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
  product?: Product;
}): Promise<{
  element: null | T;
  atomicProduct: FixtureAtomicProduct;
  atomicInterface: FixtureAtomicCommerceInterface;
}> {
  const atomicProduct = await fixture<FixtureAtomicProduct>(
    html`<atomic-product .product=${product}></atomic-product>`
  );

  atomicProduct.setRenderTemplate(template);

  const productTemplate = html`${atomicProduct}`;
  const {atomicInterface} = await renderInAtomicCommerceInterface({
    template: productTemplate,
    bindings,
  });

  await atomicProduct.updateComplete;
  await atomicInterface.updateComplete;

  if (!selector) {
    return {element: null, atomicProduct, atomicInterface};
  }

  const element = atomicProduct.shadowRoot!.querySelector<T>(selector)!;
  await element?.updateComplete;

  return {element, atomicProduct, atomicInterface};
}

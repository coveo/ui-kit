import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

function defaultTemplate() {
  const content = document.createDocumentFragment();
  const linkEl = document.createElement('atomic-product-link');
  const descEl = document.createElement('atomic-product-description');
  const imgEl = document.createElement('atomic-product-image');

  const ratingEl = document.createElement('atomic-product-rating');
  ratingEl.setAttribute('field', 'ec_rating');

  const priceEl = document.createElement('atomic-product-price');
  priceEl.setAttribute('currency', 'USD');
  priceEl.className = 'text-2xl';

  content.appendChild(linkEl);
  content.appendChild(imgEl);
  content.appendChild(descEl);
  return {
    content,
    conditions: [],
  };
}

export class ProductTemplateProvider extends TemplateProvider<Product> {
  constructor(props: TemplateProviderProps<Product>) {
    super(
      props,
      () => buildProductTemplatesManager(),
      () => defaultTemplate()
    );
  }
}

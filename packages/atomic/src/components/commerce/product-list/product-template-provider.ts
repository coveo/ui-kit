import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

function defaultTemplate() {
  const content = document.createDocumentFragment();

  const linkEl = document.createElement('atomic-product-link');
  linkEl.className = 'font-bold';

  const brandEl = document.createElement('atomic-product-text');
  brandEl.setAttribute('field', 'ec_brand');
  brandEl.className = 'block text-neutral-dark';

  const imgEl = document.createElement('atomic-product-image');
  imgEl.setAttribute('field', 'ec_thumbnails');

  const ratingEl = document.createElement('atomic-product-rating');
  ratingEl.setAttribute('field', 'ec_rating');

  const priceEl = document.createElement('atomic-product-price');
  priceEl.setAttribute('currency', 'USD');
  priceEl.className = 'text-2xl';

  const descEl = document.createElement('atomic-product-description');

  content.appendChild(linkEl);
  content.appendChild(brandEl);
  content.appendChild(imgEl);
  content.appendChild(ratingEl);
  content.appendChild(priceEl);
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

import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

function defaultTemplate() {
  const content = document.createDocumentFragment();
  const linkEl = document.createElement('atomic-product-link');
  const descEl = document.createElement('atomic-product-description');
  const priceEl = document.createElement('atomic-product-price');
  const imgEl = document.createElement('atomic-product-image');
  imgEl.setAttribute('field', 'ec_thumbnails');
  priceEl.setAttribute('currency', 'USD');
  content.appendChild(linkEl);
  content.appendChild(imgEl);
  content.appendChild(descEl);
  content.appendChild(priceEl);
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

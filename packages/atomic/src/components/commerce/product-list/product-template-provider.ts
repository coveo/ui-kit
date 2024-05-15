import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

// TODO: Add JSX support for default template
function defaultTemplate() {
  const content = document.createDocumentFragment();

  const markup = `
    <atomic-product-link class="font-bold"></atomic-product-link>
    <atomic-product-text field="ec_brand" class="block text-neutral-dark"></atomic-product-text>
    <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    <atomic-product-rating rating-details-field="ec_rating" field="ec_rating"></atomic-product-rating>
    <atomic-product-price currency="USD" class="text-2xl"></atomic-product-price>
    <atomic-product-description></atomic-product-description>
    <atomic-product-children></atomic-product-children>
  `;

  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  content.appendChild(template.content);

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

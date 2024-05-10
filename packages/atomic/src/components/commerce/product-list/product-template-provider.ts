import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

function defaultTemplate() {
  const content = document.createDocumentFragment();

  const markup = `
    <atomic-product-link class="font-bold"></atomic-product-link>
    <atomic-product-text field="ec_brand" class="block text-neutral-dark"></atomic-product-text>
    <atomic-product-image field="ec_thumbnails" fallback="https://placehold.co/600?text=No+image+available"></atomic-product-image>
    <atomic-product-rating field="ec_rating"></atomic-product-rating>
    <atomic-product-price currency="USD" class="text-2xl"></atomic-product-price>
    <atomic-product-description></atomic-product-description>
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

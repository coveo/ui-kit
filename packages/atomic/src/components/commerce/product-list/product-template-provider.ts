import {Product, buildProductTemplatesManager} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

// TODO: Add JSX support for default template
function defaultTemplate() {
  const content = document.createDocumentFragment();

  const markup = `
    <atomic-product-section-name>
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
    </atomic-product-section-visual>
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

import {
  ProductRecommendation,
  buildProductTemplatesManager,
} from '@coveo/headless/commerce';
import {
  TemplateProvider,
  TemplateProviderProps,
} from '../../common/template-provider/template-provider';

function defaultTemplate() {
  const content = document.createDocumentFragment();
  const linkEl = document.createElement('atomic-product-link');
  const imgEl = document.createElement('atomic-product-image');
  content.appendChild(linkEl);
  content.appendChild(imgEl);
  return {
    content,
    conditions: [],
  };
}

export class ProductTemplateProvider extends TemplateProvider<ProductRecommendation> {
  constructor(props: TemplateProviderProps<ProductRecommendation>) {
    super(
      props,
      () => buildProductTemplatesManager(),
      () => defaultTemplate()
    );
  }
}

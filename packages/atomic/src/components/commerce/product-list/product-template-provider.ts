import {
  buildProductTemplatesManager,
  type Product,
  type Template,
} from '@coveo/headless/commerce';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import {
  TemplateProvider,
  type TemplateProviderProps,
} from '../../common/template-provider/template-provider';
import '../atomic-product-template/atomic-product-template.js';

export class ProductTemplateProvider extends TemplateProvider<Product> {
  constructor(
    props: TemplateProviderProps<Product>,
    private gridCellLinkTarget?: ItemTarget
  ) {
    super(props, () => buildProductTemplatesManager());
  }

  protected makeDefaultTemplate(): Template<
    Product,
    DocumentFragment,
    DocumentFragment
  > {
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

    const linkContent = document.createDocumentFragment();
    const linkMarkup = `
      <atomic-product-link>
      ${this.gridCellLinkTarget ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>` : ''}
      </atomic-product-link>
    `;
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = linkMarkup.trim();
    linkContent.appendChild(linkTemplate.content);

    return {
      content,
      linkContent,
      conditions: [],
    };
  }
}

import {
  buildSpotlightContentTemplatesManager,
  type SpotlightContent,
  type Template,
} from '@coveo/headless/commerce';
import type {ItemTarget} from '@/src/components/common/layout/item-layout-utils';
import {
  TemplateProvider,
  type TemplateProviderProps,
} from '@/src/components/common/template-provider/template-provider';
import '@/src/components/commerce/atomic-spotlight-content-template/atomic-spotlight-content-template';

export class SpotlightContentTemplateProvider extends TemplateProvider<SpotlightContent> {
  constructor(
    props: TemplateProviderProps<SpotlightContent>,
    private gridCellLinkTarget?: ItemTarget
  ) {
    super(props, () => buildSpotlightContentTemplatesManager());
  }

  protected makeDefaultTemplate(): Template<SpotlightContent, DocumentFragment, DocumentFragment> {
    const content = document.createDocumentFragment();
    const template = document.createElement('template');
    template.innerHTML = `
      <atomic-product-image></atomic-product-image>
      <div class="spotlight-content-body">
        <atomic-product-link class="font-bold"></atomic-product-link>
        <atomic-product-text field="description"></atomic-product-text>
      </div>
    `.trim();
    content.appendChild(template.content);

    const linkContent = document.createDocumentFragment();
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `
      <atomic-product-link>
      ${this.gridCellLinkTarget ? `<a slot="attributes" target="${this.gridCellLinkTarget}"></a>` : ''}
      </atomic-product-link>
    `.trim();
    linkContent.appendChild(linkTemplate.content);

    return {
      content,
      linkContent,
      conditions: [],
    };
  }
}

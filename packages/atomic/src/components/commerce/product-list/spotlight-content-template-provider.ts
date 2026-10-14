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
import '@/src/components/commerce/atomic-commerce-text/atomic-commerce-text';
import ArrowLongRightIcon from '../../../images/arrow-long-right.svg';
import StarOutlineIcon from '../../../images/star-outline.svg';

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
      <div class="spotlight-content-card">
        <div class="spotlight-content-tag">
          <span class="spotlight-content-icon" aria-hidden="true">${StarOutlineIcon}</span>
          <atomic-commerce-text value="spotlight"></atomic-commerce-text>
        </div>
        <div class="spotlight-content-body">
          <atomic-product-image></atomic-product-image>
          <div class="spotlight-content-details">
            <atomic-product-text class="spotlight-content-name" field="name"></atomic-product-text>
            <atomic-product-link class="spotlight-content-call-to-action">
              <atomic-commerce-text value="see-more"></atomic-commerce-text>
              <span class="spotlight-content-visually-hidden">
                <atomic-product-text field="name"></atomic-product-text>
              </span>
              <span class="spotlight-content-icon" aria-hidden="true">${ArrowLongRightIcon}</span>
            </atomic-product-link>
          </div>
        </div>
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

import type {
  ProductTemplate,
  ProductTemplateCondition,
} from '@coveo/headless/commerce';
import type {ReactiveControllerHost} from 'lit';
import {
  BaseTemplateController,
  type TemplateContent,
} from '@/src/components/common/template-controller/base-template-controller';

type ProductTemplateHost = ReactiveControllerHost &
  HTMLElement & {error?: Error};

export class ProductTemplateController extends BaseTemplateController<ProductTemplateCondition> {
  constructor(
    host: ProductTemplateHost,
    validParents: string[],
    allowEmpty: boolean = false
  ) {
    super(host, validParents, allowEmpty);
  }

  getTemplate(
    conditions: ProductTemplateCondition[]
  ): ProductTemplate<TemplateContent> | null {
    const baseTemplate = this.getBaseTemplate(conditions);
    if (!baseTemplate) {
      return null;
    }
    return {
      conditions: conditions.concat(this.matchConditions),
      content: getTemplateElement(this.host).content!,
      linkContent: this.getLinkTemplateElement(this.host).content!,
      priority: 1,
    };
  }

  protected getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<atomic-product-link>${this.currentGridCellLinkTarget ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>` : ''}</atomic-product-link>`;
    return linkTemplate;
  }
}

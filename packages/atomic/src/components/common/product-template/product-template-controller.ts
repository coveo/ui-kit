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
      conditions: baseTemplate.conditions,
      content: baseTemplate.content,
      linkContent: baseTemplate.linkContent,
      priority: baseTemplate.priority,
    };
  }

  protected getWarnings() {
    return {
      scriptTag:
        'Any "script" tags defined inside of "template" elements are not supported and will not be executed when the products are rendered.',
      sectionMix:
        'Product templates should only contain section elements or non-section elements, not both. Future updates could unpredictably affect this product template.',
    };
  }

  protected getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<atomic-product-link>${this.currentGridCellLinkTarget ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>` : ''}</atomic-product-link>`;
    return linkTemplate;
  }
}

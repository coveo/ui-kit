import type {Product, Template} from '@coveo/headless/commerce';
import type {ReactiveControllerHost} from 'lit';
import {
  BaseTemplateController,
  type TemplateContent,
} from '@/src/components/common/template-controller/base-template-controller';

type ProductTemplateHost = ReactiveControllerHost & HTMLElement & {error?: Error};
type TemplateCondition<TItem> = (item: TItem) => boolean;

export class ProductTemplateController<TItem = Product> extends BaseTemplateController<
  TemplateCondition<TItem>
> {
  constructor(host: ProductTemplateHost, validParents: string[], allowEmpty: boolean = false) {
    super(host, validParents, allowEmpty);
  }

  getTemplate(
    conditions: TemplateCondition<TItem>[]
  ): Template<TItem, TemplateContent, TemplateContent> | null {
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

  protected getDefaultLinkTemplateElement() {
    const linkTemplate = document.createElement('template');
    linkTemplate.innerHTML = `<atomic-product-link>${this.currentGridCellLinkTarget ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>` : ''}</atomic-product-link>`;
    return linkTemplate;
  }
}

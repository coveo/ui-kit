import type {
  ResultTemplate as RecsResultTemplate,
  ResultTemplateCondition as RecsResultTemplateCondition,
} from '@coveo/headless/recommendation';
import type {ReactiveControllerHost} from 'lit';
import {
  BaseTemplateController,
  type TemplateContent,
} from '@/src/components/common/template-controller/base-template-controller';

type RecsResultTemplateHost = ReactiveControllerHost &
  HTMLElement & {error?: Error};

export class RecsResultTemplateController extends BaseTemplateController<RecsResultTemplateCondition> {
  constructor(
    host: RecsResultTemplateHost,
    validParents: string[],
    allowEmpty: boolean = false
  ) {
    super(host, validParents, allowEmpty);
  }

  getTemplate(
    conditions: RecsResultTemplateCondition[]
  ): RecsResultTemplate<TemplateContent> | null {
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
    linkTemplate.innerHTML = `<atomic-result-link>${
      this.currentGridCellLinkTarget
        ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>`
        : ''
    }</atomic-result-link>`;
    return linkTemplate;
  }
}

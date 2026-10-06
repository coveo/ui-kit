import type {
  SpotlightContentTemplate,
  SpotlightContentTemplateCondition,
} from '@coveo/headless/commerce';
import type {ReactiveControllerHost} from 'lit';
import {
  BaseTemplateController,
  type TemplateContent,
} from '@/src/components/common/template-controller/base-template-controller';

type SpotlightContentTemplateHost = ReactiveControllerHost & HTMLElement & {error?: Error};

export class SpotlightContentTemplateController extends BaseTemplateController<SpotlightContentTemplateCondition> {
  constructor(
    host: SpotlightContentTemplateHost,
    validParents: string[],
    allowEmpty: boolean = false
  ) {
    super(host, validParents, allowEmpty);
  }

  getTemplate(
    conditions: SpotlightContentTemplateCondition[]
  ): SpotlightContentTemplate<TemplateContent> | null {
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
    linkTemplate.innerHTML = `<atomic-spotlight-content-link>${this.currentGridCellLinkTarget ? `<a slot="attributes" target="${this.currentGridCellLinkTarget}"></a>` : ''}</atomic-spotlight-content-link>`;
    return linkTemplate;
  }
}

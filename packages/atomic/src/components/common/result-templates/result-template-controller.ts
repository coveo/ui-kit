import type {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import type {ReactiveControllerHost} from 'lit';
import {
  BaseTemplateController,
  type TemplateContent,
} from '@/src/components/common/template-controller/base-template-controller';

type ResultTemplateHost = ReactiveControllerHost &
  HTMLElement & {error?: Error};

export class ResultTemplateController extends BaseTemplateController<ResultTemplateCondition> {
  constructor(
    host: ResultTemplateHost,
    validParents: string[],
    allowEmpty: boolean = false
  ) {
    super(host, validParents, allowEmpty);
  }

  getTemplate(
    conditions: ResultTemplateCondition[]
  ): ResultTemplate<TemplateContent> | null {
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
        'Any "script" tags inside "template" elements are not supported and will not be executed when the results are rendered.',
      sectionMix:
        'Result templates should only contain section OR non-section elements, not both. Future updates could unpredictably affect this template.',
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

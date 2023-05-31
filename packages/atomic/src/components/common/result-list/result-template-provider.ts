import {
  ResultTemplate,
  ResultTemplatesManager,
  buildResultTemplatesManager,
} from '@coveo/headless';
import {AnyBindings} from '../interface/bindings';
import {AnyResult, extractUnfoldedResult} from '../interface/result';
import {TemplateContent} from '../result-templates/result-template-common';

export interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ResultTemplate<DocumentFragment> | null>;
}

export interface ResultTemplateProviderProps {
  bindings: AnyBindings;
  getResultTemplateRegistered(): boolean;
  setResultTemplateRegistered(value: boolean): void;
  getTemplateHasError(): boolean;
  setTemplateHasError(value: boolean): void;
  templateElements: TemplateElement[];
  includeDefaultTemplate: boolean;
}

export class ResultTemplateProvider {
  private resultTemplatesManager!: ResultTemplatesManager<TemplateContent>;

  constructor(private props: ResultTemplateProviderProps) {
    this.registerResultTemplates();
  }

  private makeDefaultTemplate(): ResultTemplate<DocumentFragment> {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);
    return {
      content,
      conditions: [],
    };
  }

  private async registerResultTemplates() {
    this.resultTemplatesManager = buildResultTemplatesManager(
      this.props.bindings.engine
    );

    const customTemplates = await Promise.all(
      this.props.templateElements.map(async (resultTemplateElement) => {
        const template = await resultTemplateElement.getTemplate();
        if (!template) {
          this.props.setTemplateHasError(true);
        }
        return template;
      })
    );

    const templates = (
      !customTemplates.length && this.props.includeDefaultTemplate
        ? [this.makeDefaultTemplate()]
        : []
    ).concat(
      customTemplates.filter(
        (template) => template
      ) as ResultTemplate<DocumentFragment>[]
    );

    this.resultTemplatesManager.registerTemplates(...templates);
    this.props.setResultTemplateRegistered(true);
  }

  public getTemplateContent(result: AnyResult) {
    return this.resultTemplatesManager.selectTemplate(
      extractUnfoldedResult(result)
    )!;
  }

  public get templatesRegistered() {
    return this.props.getResultTemplateRegistered();
  }

  public get hasError() {
    return this.props.getTemplateHasError();
  }
}

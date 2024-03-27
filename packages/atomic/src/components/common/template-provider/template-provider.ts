import {Template, TemplatesManager} from '@coveo/headless';

export interface TemplateElement<ItemType> extends HTMLElement {
  getTemplate(): Promise<Template<ItemType, DocumentFragment> | null>;
}

export interface TemplateProviderProps<ItemType> {
  getResultTemplateRegistered(): boolean;
  setResultTemplateRegistered(value: boolean): void;
  getTemplateHasError(): boolean;
  setTemplateHasError(value: boolean): void;
  templateElements: TemplateElement<ItemType>[];
  includeDefaultTemplate: boolean;
}

function defaultTemplate() {
  const content = document.createDocumentFragment();
  const linkEl = document.createElement('atomic-result-link');
  content.appendChild(linkEl);
  return {
    content,
    conditions: [],
  };
}

export class TemplateProvider<ItemType> {
  private templateManager: TemplatesManager<ItemType, DocumentFragment>;

  constructor(
    private props: TemplateProviderProps<ItemType>,
    private buildManager: () => TemplatesManager<ItemType, DocumentFragment>,
    private makeDefaultTemplate: () => Template<
      ItemType,
      DocumentFragment
    > = defaultTemplate
  ) {
    this.templateManager = this.buildManager();
    this.registerResultTemplates();
  }

  private async registerResultTemplates() {
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
      customTemplates.filter((template) => template) as Template<
        ItemType,
        DocumentFragment
      >[]
    );

    this.templateManager.registerTemplates(...templates);
    this.props.setResultTemplateRegistered(true);
  }

  public getTemplateContent(item: ItemType) {
    return this.templateManager.selectTemplate(item)!;
  }

  public get templatesRegistered() {
    return this.props.getResultTemplateRegistered();
  }

  public get hasError() {
    return this.props.getTemplateHasError();
  }
}

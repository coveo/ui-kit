import type {Template, TemplatesManager} from '@coveo/headless';

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

export abstract class TemplateProvider<ItemType> {
  private templateManager: TemplatesManager<
    ItemType,
    DocumentFragment,
    DocumentFragment
  >;

  protected abstract makeDefaultTemplate(): Template<
    ItemType,
    DocumentFragment,
    DocumentFragment
  >;

  constructor(
    private props: TemplateProviderProps<ItemType>,
    private buildManager: () => TemplatesManager<
      ItemType,
      DocumentFragment,
      DocumentFragment
    >
  ) {
    this.templateManager = this.buildManager();
    this.registerResultTemplates();
  }

  private async registerResultTemplates() {
    const customTemplates = await Promise.all(
      this.props.templateElements.map(async (resultTemplateElement) => {
        if (!('getTemplate' in resultTemplateElement)) {
          await customElements.whenDefined(
            (resultTemplateElement as HTMLElement).tagName.toLowerCase()
          );
        }

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
        DocumentFragment,
        DocumentFragment
      >[]
    );

    this.templateManager.registerTemplates(...templates);
    this.props.setResultTemplateRegistered(true);
  }

  public getTemplateContent(item: ItemType) {
    return this.templateManager.selectTemplate(item)!;
  }

  public getLinkTemplateContent(item: ItemType) {
    return this.templateManager.selectLinkTemplate(item)!;
  }

  public getEmptyLinkTemplateContent() {
    return document.createDocumentFragment();
  }

  public get templatesRegistered() {
    return this.props.getResultTemplateRegistered();
  }

  public get hasError() {
    return this.props.getTemplateHasError();
  }
}

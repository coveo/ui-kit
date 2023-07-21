import {
  ProductRecommendation,
  ProductRecommendationTemplate,
  ProductRecommendationTemplatesManager,
  buildProductRecommendationTemplatesManager,
} from '@coveo/headless/product-listing';
import {TemplateContent} from '../../common/result-templates/result-template-common';
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';

export interface TemplateElement extends HTMLElement {
  getTemplate(): Promise<ProductRecommendationTemplate<DocumentFragment> | null>;
}

export interface ProductRecommendationTemplateProviderProps {
  bindings: ProductListingBindings;
  getProductRecommendationTemplateRegistered(): boolean;
  setProductRecommendationTemplateRegistered(value: boolean): void;
  getTemplateHasError(): boolean;
  setTemplateHasError(value: boolean): void;
  templateElements: TemplateElement[];
  includeDefaultTemplate: boolean;
}

export class ProductRecommendationTemplateProvider {
  private productRecommendationTemplatesManager!: ProductRecommendationTemplatesManager<TemplateContent>;

  constructor(private props: ProductRecommendationTemplateProviderProps) {
    console.log('constructor', props);
    this.registerProductRecommendationTemplates();
  }

  private makeDefaultTemplate(): ProductRecommendationTemplate<DocumentFragment> {
    const content = document.createDocumentFragment();
    const linkEl = document.createElement('atomic-result-link');
    content.appendChild(linkEl);
    return {
      content,
      conditions: [],
    };
  }

  private async registerProductRecommendationTemplates() {
    console.log('registerProductRecommendationTemplates', this.props.bindings);
    this.productRecommendationTemplatesManager =
      buildProductRecommendationTemplatesManager(this.props.bindings.engine);

    console.log('build', this.productRecommendationTemplatesManager);
    const customTemplates = await Promise.all(
      this.props.templateElements.map(
        async (productRecommendationTemplateElement) => {
          const template =
            await productRecommendationTemplateElement.getTemplate();
          if (!template) {
            this.props.setTemplateHasError(true);
          }
          return template;
        }
      )
    );

    const templates = (
      !customTemplates.length && this.props.includeDefaultTemplate
        ? [this.makeDefaultTemplate()]
        : []
    ).concat(
      customTemplates.filter(
        (template) => template
      ) as ProductRecommendationTemplate<DocumentFragment>[]
    );

    this.productRecommendationTemplatesManager.registerTemplates(...templates);
    this.props.setProductRecommendationTemplateRegistered(true);
  }

  public getTemplateContent(productRec: ProductRecommendation) {
    return this.productRecommendationTemplatesManager.selectTemplate(
      productRec
    )!;
  }

  public get templatesRegistered() {
    return this.props.getProductRecommendationTemplateRegistered();
  }

  public get hasError() {
    return this.props.getTemplateHasError();
  }
}

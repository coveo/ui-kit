import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {
  buildTemplatesManager,
  Template,
  TemplateCondition,
} from '../../templates/templates-manager';

export type ProductTemplate<Content = unknown> = Template<
  ProductRecommendation,
  Content
>;
export type ProductTemplateCondition = TemplateCondition<ProductRecommendation>;

export interface ProductTemplateManager<Content = unknown> {
  /**
   * Registers any number of product templates in the manager.
   * @param templates (...Template<Product, Content>) A list of templates to register.
   */
  registerTemplates(
    ...newTemplates: Template<ProductRecommendation, Content>[]
  ): void;
  /**
   * Selects the highest priority template for which the given product satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param product (Product) The product for which to select a template.
   * @returns (Content) The content of the selected template, or null if no template can be selected for the given product.
   */
  selectTemplate(product: ProductRecommendation): Content | null;
}

/**
 * A manager in which product templates can be registered and selected based on a list of conditions and a priority index.
 * @returns (ProductTemplateManager<Content>) A new product template manager.
 */
export function buildProductTemplateManager<
  Content = unknown,
>(): ProductTemplatesManager<Content> {
  return buildTemplatesManager<ProductRecommendation, Content>();
}

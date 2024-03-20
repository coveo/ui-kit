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

export interface ProductTemplatesManager<Content = unknown> {
  /**
   * Registers any number of result templates in the manager.
   * @param templates (...ResultTemplate<Content>) A list of templates to register.
   */
  registerTemplates(
    ...newTemplates: Template<ProductRecommendation, Content>[]
  ): void;
  /**
   * Selects the highest priority template for which the given result satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param result (Result) The result for which to select a template.
   * @returns (Content) The selected template's content, or null if no template's conditions are satisfied.
   */
  selectTemplate(product: ProductRecommendation): Content | null;
}

/**
 * A manager in which product templates can be registered and selected based on a list of conditions and priority.
 * @param engine (HeadlessEngine) The `HeadlessEngine` instance of your application.
 * @returns (ResultTemplatesManager<Content, State>) A new result templates manager.
 */
export function buildProductTemplatesManager<
  Content = unknown,
>(): ProductTemplatesManager<Content> {
  return buildTemplatesManager<ProductRecommendation, Content>();
}

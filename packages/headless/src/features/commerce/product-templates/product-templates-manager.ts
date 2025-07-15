import type {Product} from '../../../api/commerce/common/product.js';
import {
  buildTemplatesManager,
  type Template,
  type TemplateCondition,
} from '../../templates/templates-manager.js';

export type ProductTemplate<Content = unknown> = Template<Product, Content>;
export type ProductTemplateCondition = TemplateCondition<Product>;

export interface ProductTemplatesManager<
  Content = unknown,
  LinkContent = unknown,
> {
  /**
   * Registers any number of product templates in the manager.
   * @param templates (...Template<Product, Content>) A list of templates to register.
   */
  registerTemplates: (...templates: Template<Product, Content>[]) => void;
  /**
   * Selects the highest priority template for which the given product satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param product (Product) The product for which to select a template.
   * @returns (Content) The content of the selected template, or null if no template can be selected for the given product.
   */
  selectTemplate: (product: Product) => Content | null;
  /**
   * Selects the highest priority link template for which the given product satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param product (Product) The product for which to select a template.
   * @returns (Content) The content of the selected template, or null if no template can be selected for the given product.
   */
  selectLinkTemplate: (product: Product) => LinkContent | null;
}

/**
 * A manager in which product templates can be registered and selected based on a list of conditions and a priority index.
 * @returns (ProductTemplatesManager<Content>) A new product template manager.
 */
export function buildProductTemplatesManager<
  Content = unknown,
  LinkContent = unknown,
>(): ProductTemplatesManager<Content, LinkContent> {
  return buildTemplatesManager<Product, Content, LinkContent>();
}

import type {SpotlightContent} from '../../../api/commerce/common/result.js';
import {
  buildTemplatesManager,
  type Template,
  type TemplateCondition,
} from '../../templates/templates-manager.js';

export type SpotlightContentTemplate<Content = unknown> = Template<SpotlightContent, Content>;
export type SpotlightContentTemplateCondition = TemplateCondition<SpotlightContent>;

export interface SpotlightContentTemplatesManager<Content = unknown, LinkContent = unknown> {
  /**
   * Registers any number of spotlight content templates in the manager.
   * @param templates (...Template<SpotlightContent, Content>) A list of templates to register.
   */
  registerTemplates: (...templates: Template<SpotlightContent, Content>[]) => void;
  /**
   * Selects the highest priority template for which the given spotlight content satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param spotlightContent (SpotlightContent) The spotlight content for which to select a template.
   * @returns (Content) The content of the selected template, or null if no template can be selected for the given spotlight content.
   */
  selectTemplate: (spotlightContent: SpotlightContent) => Content | null;
  /**
   * Selects the highest priority link template for which the given spotlight content satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param spotlightContent (SpotlightContent) The spotlight content for which to select a template.
   * @returns (LinkContent) The content of the selected link template, or null if no template can be selected for the given spotlight content.
   */
  selectLinkTemplate: (spotlightContent: SpotlightContent) => LinkContent | null;
}

/**
 * A manager in which spotlight content templates can be registered and selected based on a list of conditions and a priority index.
 * @returns (SpotlightContentTemplatesManager<Content, LinkContent>) A new spotlight content template manager.
 */
export function buildSpotlightContentTemplatesManager<
  Content = unknown,
  LinkContent = unknown,
>(): SpotlightContentTemplatesManager<Content, LinkContent> {
  return buildTemplatesManager<SpotlightContent, Content, LinkContent>();
}

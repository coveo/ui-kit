import {type SpotlightContent, SpotlightContentTemplatesHelpers} from '@coveo/headless/commerce';
import {customElement} from 'lit/decorators.js';
import {CommerceResultTemplateElement} from '@/src/components/commerce/product-list/commerce-result-template-element';
import '@/src/components/commerce/atomic-spotlight-content/atomic-spotlight-content';

/**
 * The `atomic-spotlight-content-template` component determines the format of the Spotlight Content displayed by the
 * `atomic-commerce-product-list` component, depending on the conditions that are defined for each template.
 *
 * Inside the template, use `atomic-product-link`, `atomic-product-image` and `atomic-product-text`: they render the
 * fields of the Spotlight Content (such as `name`, `description` and its images) and log Spotlight Content analytics.
 *
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that must be matched by a Spotlight Content item for the template to apply. For example, a template with the following attribute only applies to Spotlight Content whose `id` is `summer-sale`: `must-match-id="summer-sale"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that must not be matched by a Spotlight Content item for the template to apply. For example, a template with the following attribute only applies to Spotlight Content whose `id` is not `summer-sale`: `must-not-match-id="summer-sale"`;type: Record<string, string[]> ;default: {}
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-product-link` component.
 */
@customElement('atomic-spotlight-content-template')
export class AtomicSpotlightContentTemplate extends CommerceResultTemplateElement<SpotlightContent> {
  protected readonly templateHelpers = SpotlightContentTemplatesHelpers;

  constructor() {
    super(['atomic-commerce-product-list']);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content-template': AtomicSpotlightContentTemplate;
  }
}

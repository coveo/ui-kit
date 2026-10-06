import {
  type SpotlightContentTemplate,
  type SpotlightContentTemplateCondition,
  SpotlightContentTemplatesHelpers,
} from '@coveo/headless/commerce';
import {LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SpotlightContentTemplateController} from '@/src/components/commerce/spotlight-content-template-component-utils/spotlight-content-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {mapProperty} from '@/src/utils/props-utils';
import '@/src/components/commerce/atomic-spotlight-content/atomic-spotlight-content';

/**
 * The `atomic-spotlight-content-template` component determines the format of the Spotlight Content displayed by the
 * `atomic-commerce-product-list` component, depending on the conditions that are defined for each template.
 *
 * Spotlight Content isn't a product: use spotlight content template components (such as `atomic-spotlight-content-link`,
 * `atomic-spotlight-content-image` and `atomic-spotlight-content-text`) inside this template, not product template components.
 *
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that must be matched by a Spotlight Content item for the template to apply. For example, a template with the following attribute only applies to Spotlight Content whose `id` is `summer-sale`: `must-match-id="summer-sale"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that must not be matched by a Spotlight Content item for the template to apply. For example, a template with the following attribute only applies to Spotlight Content whose `id` is not `summer-sale`: `must-not-match-id="summer-sale"`;type: Record<string, string[]> ;default: {}
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-spotlight-content-link` component.
 */
@customElement('atomic-spotlight-content-template')
export class AtomicSpotlightContentTemplate extends LitElement implements LitElementWithError {
  private spotlightContentTemplateController: SpotlightContentTemplateController;

  @state() error!: Error;

  /**
   * A function that must return true on Spotlight Content for the template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to Spotlight Content whose `name` contains `sale`:
   * `document.querySelector('#target-template').conditions = [(spotlightContent) => /sale/i.test(spotlightContent.name)];`
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: SpotlightContentTemplateCondition[] = [];

  /**
   * The field and values that define which Spotlight Content the condition must be applied to.
   * For example, a template with the following attribute only applies to Spotlight Content whose `id` is `summer-sale`:
   * `must-match-id="summer-sale"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which Spotlight Content the condition must not be applied to.
   * For example, a template with the following attribute only applies to Spotlight Content whose `id` is not `summer-sale`:
   * `must-not-match-id="summer-sale"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    const validParents = ['atomic-commerce-product-list'];
    const allowEmpty = true;
    this.spotlightContentTemplateController = new SpotlightContentTemplateController(
      this,
      validParents,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.spotlightContentTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      SpotlightContentTemplatesHelpers
    );
  }

  /**
   * Gets the Spotlight Content template to apply based on the evaluated conditions.
   */
  public async getTemplate(): Promise<SpotlightContentTemplate<DocumentFragment> | null> {
    return this.spotlightContentTemplateController.getTemplate(this.conditions);
  }

  @errorGuard()
  render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content-template': AtomicSpotlightContentTemplate;
  }
}

import type {
  ResultTemplate as InsightResultTemplate,
  ResultTemplateCondition as InsightResultTemplateCondition,
} from '@coveo/headless/insight';
import {ResultTemplatesHelpers as InsightResultTemplatesHelpers} from '@coveo/headless/insight';
import {LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-insight-result-template` component determines the format of the query results for Insight interfaces, depending on the conditions that are defined for each template.
 *
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-result-link` component.
 */
@customElement('atomic-insight-result-template')
@withTailwindStyles
export class AtomicInsightResultTemplate
  extends LitElement
  implements LitElementWithError
{
  private resultTemplateController: ResultTemplateController;
  @state() error!: Error;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: InsightResultTemplateCondition[] = [];

  /**
   * The field and values that define which result items the condition must be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which result items the condition must not be applied to.
   *
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    const validParents = [
      'atomic-insight-result-list',
      'atomic-insight-folded-result-list',
    ];
    const allowEmpty = true;
    this.resultTemplateController = new ResultTemplateController(
      this,
      validParents,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.resultTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      InsightResultTemplatesHelpers
    );
  }

  @errorGuard()
  render() {
    return nothing;
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  public async getTemplate(): Promise<InsightResultTemplate<DocumentFragment> | null> {
    const template = this.resultTemplateController?.getTemplate(
      this.conditions
    );
    return template;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-template': AtomicInsightResultTemplate;
  }
}

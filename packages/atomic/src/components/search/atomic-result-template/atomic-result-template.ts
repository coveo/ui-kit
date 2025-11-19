import type {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';
import '@/src/components/common/atomic-component-error/atomic-component-error';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import '../atomic-result/atomic-result';
import type {LitElementWithError} from '@/src/decorators/types';

/**
 * A result template determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-result-link` component.
 */
@customElement('atomic-result-template')
@withTailwindStyles
export class AtomicResultTemplate
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
  conditions: ResultTemplateCondition[] = [];

  /**
   * The field and values that define which results the condition must be applied to.
   * For example, a template with the following attribute only applies to results whose `sourcetype` is `YouTube` or `Salesforce`:
   * `must-match-sourcetype="YouTube,Salesforce"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which results the condition must not be applied to.
   * For example, a template with the following attribute only applies to results whose `sourcetype` is not `YouTube`:
   * `must-not-match-sourcetype="YouTube"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;
  constructor() {
    super();
    const validParent = [
      'atomic-result-list',
      'atomic-folded-result-list',
      'atomic-search-box-instant-results',
    ];
    const allowEmpty = true;
    this.resultTemplateController = new ResultTemplateController(
      this,
      validParent,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.resultTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      ResultTemplatesHelpers
    );
  }

  @errorGuard()
  render() {
    return html`${nothing}`;
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  public async getTemplate(): Promise<ResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateController?.getTemplate(this.conditions) || null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-template': AtomicResultTemplate;
  }
}

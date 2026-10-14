import type {Template} from '@coveo/headless/commerce';
import {LitElement, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {ProductTemplateController} from '@/src/components/common/product-template/product-template-controller';
import {
  makeMatchConditions,
  type TemplateHelpers,
} from '@/src/components/common/template-controller/template-utils';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {mapProperty} from '@/src/utils/props-utils';

type TemplateCondition<TResult> = (result: TResult) => boolean;

/**
 * Shared implementation of the template elements of commerce results (`atomic-product-template` and
 * `atomic-spotlight-content-template`).
 */
export abstract class CommerceResultTemplateElement<TResult>
  extends LitElement
  implements LitElementWithError
{
  @state() error!: Error;

  /**
   * A function that must return true on items for the template to apply.
   * Set programmatically before initialization, not via attribute.
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: TemplateCondition<TResult>[] = [];

  /**
   * The field and values that define which items the condition must be applied to.
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which items the condition must not be applied to.
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  protected templateController: ProductTemplateController<TResult>;
  protected abstract readonly templateHelpers: TemplateHelpers<TemplateCondition<TResult>>;

  constructor(validParents: string[]) {
    super();
    const allowEmpty = true;
    this.templateController = new ProductTemplateController<TResult>(
      this,
      validParents,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.templateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      this.templateHelpers
    );
  }

  /**
   * Gets the template to apply based on the evaluated conditions.
   */
  public async getTemplate(): Promise<Template<TResult, DocumentFragment> | null> {
    return this.templateController.getTemplate(this.conditions);
  }

  @errorGuard()
  render() {
    return nothing;
  }
}

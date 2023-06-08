import {Component, Element, Prop, Method, State} from '@stencil/core';
import {
  ProductListingResultTemplateCondition,
  ProductListingResultTemplate,
} from '..';
import {MapProp} from '../../../utils/props-utils';
import {
  ResultTemplateCommon,
  makeMatchConditions,
} from '../../common/result-templates/result-template-common';

/**
 * The `atomic-product-listing-template` component determines the format of the query results, depending on the conditions that are defined for each template. A `template` element must be the child of an `atomic-product-listing-template`, and either an `atomic-result-list` or `atomic-folded-result-list` must be the parent of each `atomic-result-template`.
 *
 * @internal
 */
@Component({
  tag: 'atomic-product-listing-result-template',
  shadow: true,
})
export class AtomicProductListingResultTemplate {
  private resultTemplateCommon: ResultTemplateCommon;

  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;

  /**
   * A function that must return true on results for the result template to apply.
   *
   * For example, a template with the following condition only applies to results whose `title` contains `singapore`:
   * `[(result) => /singapore/i.test(result.title)]`
   */
  @Prop() public conditions: ProductListingResultTemplateCondition[] = [];

  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    this.resultTemplateCommon = new ResultTemplateCommon({
      host: this.host,
      setError: (err) => {
        this.error = err;
      },
      validParents: ['atomic-product-listing'],
      allowEmpty: true,
    });
  }

  public componentWillLoad() {
    this.resultTemplateCommon.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch
    );
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<ProductListingResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateCommon.getTemplate(this.conditions, this.error);
  }

  public render() {
    return this.resultTemplateCommon.renderIfError(this.error);
  }
}

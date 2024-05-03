import {
  ProductTemplate,
  ProductTemplateCondition,
} from '@coveo/headless/commerce';
import {Component, Element, Prop, Method, State} from '@stencil/core';
import {MapProp} from '../../../utils/props-utils';
import {ProductTemplateCommon} from './product-template-common';

/**
 * A [result template](https://docs.coveo.com/en/atomic/latest/usage/displaying-results#defining-a-result-template) determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * A `template` element must be the child of an `atomic-result-template`, and either an `atomic-result-list` or `atomic-folded-result-list` must be the parent of each `atomic-result-template`.
 *
 * **Note:** Any `<script>` tags that are defined inside a `<template>` element will not be executed when the results are being rendered.
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that define which result items the condition must be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that define which result items the condition must not be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 */
@Component({
  tag: 'atomic-product-template',
  shadow: true,
})
export class AtomicProductTemplate {
  private productTemplateCommon: ProductTemplateCommon;

  @State() public error!: Error;

  @Element() public host!: HTMLDivElement;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @Prop() public conditions: ProductTemplateCondition[] = [];

  @MapProp({splitValues: true}) public mustMatch: Record<string, string[]> = {};

  @MapProp({splitValues: true}) public mustNotMatch: Record<string, string[]> =
    {};

  constructor() {
    this.productTemplateCommon = new ProductTemplateCommon({
      host: this.host,
      setError: (err) => {
        this.error = err;
      },
      validParents: ['atomic-commerce-product-list'],
      allowEmpty: true,
    });
  }

  public componentWillLoad() {
    // TODO: Uncomment this when the `makeMatchConditions` function is implemented for product templates.
    /*  this.productTemplateCommon.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch
    ); */
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  @Method()
  public async getTemplate(): Promise<ProductTemplate<DocumentFragment> | null> {
    return this.productTemplateCommon.getTemplate(this.conditions, this.error);
  }

  public render() {
    return this.productTemplateCommon.renderIfError(this.error);
  }
}

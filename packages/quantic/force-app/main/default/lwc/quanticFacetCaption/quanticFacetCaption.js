import {api, LightningElement} from 'lwc';

/**
 * The `QuanticFacetCaption` allows to override a textual facet value caption.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-facet-caption engine-id={engineId} value="text" caption="Plain text"></c-quantic-facet-caption>
 */
export default class QuanticFacetCaption extends LightningElement {
  /**
   * The facet value to which the custom caption is applied. The value is case-sensitive.
   * @api
   * @type {string}
   */
  @api value;

  /**
   * The caption to display in the facet.
   * @api
   * @type {string}
   */
  @api caption;

  /**
   * Gets the custom captions provided by this component as an object.
   * @api
   * @type {Record<string,string>}
   * @example
   * { "text": "Plain text" }
   */
  @api
  get captions() {
    return {
      [this.value]: this.caption,
    };
  }
}

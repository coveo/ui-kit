import {LightningElement, api} from 'lwc';

/**
 * The `QuanticResultTemplate` component is used to construct result templates using predefined and formatted [slots](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_slots).
 * See [Use the Result Template Component](https://docs.coveo.com/en/quantic/latest/usage/result-template-usage/).
 * @category Result Template
 * @example
 * <c-quantic-result-template>
 *   <div slot="label"></div>
 *   <div slot="badges"></div>
 *   <div slot="actions"></div>
 *   <div slot="date"></div>
 *   <div slot="visual"></div>
 *   <div slot="title"></div>
 *   <div slot="metadata"></div>
 *   <div slot="emphasized"></div>
 *   <div slot="excerpt"></div>
 *   <div slot="bottom-metadata"></div>
 *   <div slot="children"></div>
 * </c-quantic-result-template>
 */
export default class QuanticResultTemplate extends LightningElement {
  /**
   * @type {boolean}
   */
  @api isAnyPreviewOpen = false;

  /**
   * @api
   * @type {boolean}
   */
  @api resultPreviewShouldNotBeAccessible = false;
  /**
   * Specifies whether the border of the result template should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideBorder = false;

  /** @type {boolean} */
  isHeaderEmpty = true;
  /** @type {boolean} */
  isBadgesSlotEmpty = true;

  handleHeaderSlotChange(event) {
    const slot = event.target;
    const slotHasContent = !!slot.assignedElements().length;
    if (slotHasContent) {
      this.isHeaderEmpty = false;
      if (slot.name === 'badges') {
        this.isBadgesSlotEmpty = false;
      }
    }
  }

  /** Returns the CSS class of the header of the result template */
  get headerCssClass() {
    return `slds-grid slds-wrap slds-col slds-grid_vertical-align-center slds-size_1-of-1 slds-text-align_left ${
      this.isHeaderEmpty ? '' : 'slds-m-bottom_x-small'
    }`;
  }

  /** Returns the CSS class  of the badges slot of the result template */
  get badgesSlotCssClass() {
    return `badge__container slds-col slds-order_1 slds-small-order_1 slds-medium-order_2 slds-large-order_2 slds-m-right_small ${
      this.isBadgesSlotEmpty ? '' : 'slds-m-vertical_xx-small'
    }`;
  }

  get templateClass() {
    return `lgc-bg slds-p-vertical_medium ${
      this.hideBorder || this.hasChildTemplates ? '' : 'slds-border_bottom'
    }`;
  }

  get hasChildTemplates() {
    return !!this.querySelector('*[slot="children"]');
  }
}

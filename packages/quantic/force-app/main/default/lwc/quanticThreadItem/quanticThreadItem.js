import {LightningElement, api, track} from 'lwc';

/**
 * The `QuanticThreadItem` component renders a thread item with timeline visuals and collapsible content.
 * @category Internal
 * @example
 * <c-quantic-thread-item title="Step title" disable-collapse hide-line is-expanded></c-quantic-thread-item>
 */
export default class QuanticThreadItem extends LightningElement {
  /**
   * The title displayed for the thread item.
   * @api
   * @type {string}
   */
  @api title = '';

  /**
   * Whether the thread item can be expanded or collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api disableCollapse = false;

  /**
   * Whether the timeline line should be hidden.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api hideLine = false;

  /**
   * Whether the thread item is initially expanded.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;
  }

  /** @type {boolean} */
  @track _isExpanded = false;

  connectedCallback() {
    this._isExpanded = this.disableCollapse ? true : this.isExpanded;
  }

  handleTitleClick() {
    if (this.disableCollapse) {
      return;
    }
    this._isExpanded = !this._isExpanded;
  }

  get titleButtonAriaExpanded() {
    return String(this._isExpanded);
  }

  get contentHidden() {
    return !this._isExpanded;
  }

  get titleButtonClass() {
    return `slds-button_reset slds-p-horizontal_x-small slds-p-vertical_xx-small thread-item__title-button thread-item__clamped-text${this._isExpanded ? ' slds-text-title_bold' : ''}`;
  }

  get dotClass() {
    return `thread-item__dot${this._isExpanded ? ' thread-item__dot--expanded' : ''}`;
  }
}

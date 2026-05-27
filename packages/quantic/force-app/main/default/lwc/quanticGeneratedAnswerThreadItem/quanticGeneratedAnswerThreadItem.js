import {LightningElement, api} from 'lwc';

/**
 * The `QuanticGeneratedAnswerThreadItem` component renders a generated answer
 * thread item with a timeline marker, an optional collapsible title, and
 * slotted content.
 *
 * @category Internal
 * @example
 * <c-quantic-generated-answer-thread-item
 *   title="How do I reset my password?"
 *   is-expanded
 * >
 *   <div>Thread item content</div>
 * </c-quantic-generated-answer-thread-item>
 */
export default class QuanticGeneratedAnswerThreadItem extends LightningElement {
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
   * @default false
   */
  @api disableCollapse = false;

  /**
   * Whether the thread line should be hidden.
   * @api
   * @type {boolean}
   * @default false
   */
  @api hideLine = false;

  /**
   * Whether the thread item is initially expanded.
   * @api
   * @type {boolean}
   * @default false
   */
  @api get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(value) {
    this._isExpanded = value;
  }

  /**
   * Whether the thread item should display its timeline dot.
   * @api
   * @type {boolean}
   * @default true
   */
  @api get showTimelineDot() {
    return this._showTimelineDot;
  }
  set showTimelineDot(value) {
    this._showTimelineDot = value === false ? false : true;
  }

  /** @type {boolean} */
  _isExpanded = false;
  /** @type {boolean} */
  _showTimelineDot = true;

  handleTitleClick() {
    if (this.disableCollapse) {
      return;
    }

    this._isExpanded = !this._isExpanded;
  }

  get isCollapsible() {
    return !this.disableCollapse;
  }

  get isContentVisible() {
    return this.disableCollapse || this.isExpanded;
  }

  get isContentHidden() {
    return !this.isContentVisible;
  }

  get shouldShowLine() {
    return !this.hideLine;
  }

  get titleButtonClass() {
    return 'slds-button_reset slds-text-align_left thread-item__title-button';
  }

  get titleClass() {
    return [
      'thread-item__title',
      'slds-var-p-horizontal_medium',
      'slds-text-body_regular',
      this.isContentVisible ? 'slds-text-title_bold' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get timelineDotClass() {
    return [
      'thread-item__timeline-dot',
      this.isContentVisible
        ? 'thread-item__timeline-dot--expanded'
        : 'thread-item__timeline-dot--collapsed',
    ].join(' ');
  }

  get bodyRowClass() {
    return [
      'slds-grid',
      'slds-size_1-of-1',
      'thread-item__body-row',
      this.isContentVisible ? '' : 'thread-item__body-row--collapsed',
    ].join(' ');
  }
}

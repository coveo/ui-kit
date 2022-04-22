import {LightningElement, api} from 'lwc';

/**
 * The `QuanticModal` component provides the logic to easily implement a modal in Quantic. This component handles the animation logic, exposes methods to open and close the modal, offers the option to open the modal in full screen or just to cover the search interface, and exposes a set of slots to fully customize the modal content.
 *
 * @category Search
 * @example
 * <c-quantic-modal full-screen animation="slideToLeft"></c-quantic-modal>
 */
export default class QuanticModal extends LightningElement {
  /**
   * Indicates whether the modal will be opened in full screen.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api fullScreen = false;
  /**
   * Indicates the type of animation to use to open the modal.
   * @api
   * @type {'slideToTop'|'slideToLeft'}
   * @defaultValue `slideToTop`
   */
  @api animation = 'slideToTop';

  /** @type {boolean} */
  visible = false;

  /**
   * Opens the modal.
   * @returns {void}
   */
  @api openModal() {
    this.visible = true;
  }

  /**
   * Closes the modal.
   * @returns {void}
   */
  @api closeModal() {
    this.visible = false;
  }

  /**
   * Returns the modal CSS classes.
   * @returns {string}
   */
  get modalCssClass() {
    return `modal ${this.fullScreen ? 'full-screen' : 'part-screen'} ${
      this.visible
        ? ''
        : `modal_hidden ${
            this.animation === 'slideToLeft'
              ? 'hidden-modal_slide-to-left'
              : 'hidden-modal_slide-to-top'
          }`
    }`;
  }
}

import {LightningElement, track} from 'lwc';

/**
 * @typedef {Object} QuanticModalElement
 * @method openModal
 * @method closeModal
 */

export default class ExampleQuanticModal extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Modal';
  pageDescription =
    'The QuanticModal component provides the logic to easily implement a modal in Quantic. This component handles the animation logic, exposes methods to open and close the modal, offers the option to open the modal in full screen or just to cover the search interface, and exposes a set of slots to fully customize the modal content.';

  options = [
    {
      attribute: 'fullScreen',
      label: 'Full screen',
      description: 'Indicates whether the modal will be opened in full screen.',
      defaultValue: false,
    },
    {
      attribute: 'animation',
      label: 'Animation',
      description: 'Indicates the type of animation to use to open the modal.',
      defaultValue: 'slideToTop',
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  openModal = () => {
    /** @type {QuanticModalElement} */
    const modal = this.template.querySelector('c-quantic-modal');
    modal.openModal();
  };

  closeModal = () => {
    /** @type {QuanticModalElement} */
    const modal = this.template.querySelector('c-quantic-modal');
    modal.closeModal();
  };

  async handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}

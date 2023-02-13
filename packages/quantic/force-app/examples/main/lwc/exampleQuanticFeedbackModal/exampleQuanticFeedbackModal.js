import FeedbackModal from 'c/quanticFeedbackModal';
import {LightningElement, track} from 'lwc';

export default class ExampleQuanticModal extends LightningElement {
  @track config = {};
  isConfigured = false;

  pageTitle = 'Quantic Feedback Modal';
  pageDescription = 'The QuanticFeedbackModal component overlays a message modal on top of the current app window, the modal contains a form that allows the user to give feedback.';

  options = [
    {
      attribute: 'options',
      label: 'Options',
      description: 'The options to be displayed inside the modal',
      defaultValue: JSON.stringify([
        {value: 'test1', label: 'test1'},
        {value: 'test2', label: 'test2'},
        {value: 'test3', label: 'test4'},
        {value: 'other', label: 'other'},
      ]),
    },
  ];

  get notConfigured() {
    return !this.isConfigured;
  }

  openModal = async () => {
    await FeedbackModal.open({
      size: 'small',
      label: 'Example feedback modal',
      description: 'Example feedback modal',
      options: this.prepareOptions(),
      submitFeedback: () => {},
    });
  };

  prepareOptions() {
    if (!this.config.options) {
      return null;
    }
    try {
      return JSON.parse(this.config.options);
    } catch (err) {
      return this.config.options;
    }
  }

  async handleTryItNow(evt) {
    this.config = evt.detail;
    this.isConfigured = true;
  }
}

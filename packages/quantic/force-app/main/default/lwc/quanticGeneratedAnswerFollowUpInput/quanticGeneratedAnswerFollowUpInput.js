import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import {keys} from 'c/quanticUtils';
import {api, LightningElement} from 'lwc';

/**
 * The `QuanticGeneratedAnswerFollowUpInput` component allows users to submit follow-up questions related to a generated answer.
 * @fires CustomEvent#quantic__submitfollowup
 * @category Internal
 * @example
 * <c-quantic-generated-answer-follow-up-input></c-quantic-generated-answer-follow-up-input>
 */
export default class QuanticGeneratedAnswerFollowUpInput extends LightningElement {
  labels = {
    submitFollowUp,
    askFollowUp,
  };

  /**
   * Whether the submit button is disabled.
   * @type {boolean}
   * @defaultValue false
   */
  @api
  submitButtonDisabled = false;

  /** @type {boolean} */
  _focused = false;

  handleKeyDown(event) {
    // Let the browser commit IME text before handling shortcuts like Enter during composition.
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === keys.ENTER && !event.shiftKey) {
      event.preventDefault();
      this.handleSubmitFollowUp();
    }

    if (event.key === keys.ESC) {
      event.stopPropagation();
      event.preventDefault();
      this.refs.askFollowUpInput.blur();
    }
  }

  handleSubmitFollowUp() {
    if (
      this.submitButtonDisabled ||
      this.refs.askFollowUpInput.value.trim() === ''
    ) {
      return;
    }
    this.sendSubmitFollowUpEvent();
    this.refs.askFollowUpInput.value = '';
    this.syncTextWithReplica();
    this.collapse();
  }

  handleFocus() {
    this._focused = true;
    this.syncTextWithReplica();
    this.expand();
  }

  handleBlur() {
    this._focused = false;
    this.collapse();
  }

  handleInput() {
    this.expand();
    this.syncTextWithReplica();
  }

  /**
   * Syncs the textarea value with the expander's replicated value for seamless CSS transitions.
   */
  syncTextWithReplica() {
    const expander = this.refs.expander;
    if (expander) {
      expander.dataset.replicatedValue = this.refs.askFollowUpInput.value;
    }
  }

  expand() {
    this.refs.expander?.classList.add('follow-up-input__expander--expanded');
  }

  collapse() {
    const expander = this.refs.expander;
    if (expander) {
      expander.classList.remove('follow-up-input__expander--expanded');
      delete expander.dataset.replicatedValue;
    }
  }

  /**
   * Sends the "quantic__submitfollowup" event.
   */
  sendSubmitFollowUpEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__submitfollowup', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.refs.askFollowUpInput.value,
        },
      })
    );
  }

  get inputContainerClasses() {
    return `follow-up-input__container slds-is-relative slds-grid slds-box slds-p-around_none ${this._focused ? 'follow-up-input__container--focused' : ''}`;
  }
}

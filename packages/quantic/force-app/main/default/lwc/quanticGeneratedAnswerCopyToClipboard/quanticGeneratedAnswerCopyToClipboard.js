import copied from '@salesforce/label/c.quantic_Copied';
import copy from '@salesforce/label/c.quantic_Copy';
import {copyToClipboard} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticGeneratedAnswerCopyToClipboard` component displays a button responsible for copying the generated answer to clipboard.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-copy-to-clipboard answer={answer}></c-quantic-generated-answer-copy-to-clipboard>
 */
export default class QuanticGeneratedAnswerCopyToClipboard extends LightningElement {
  /**
   * The answer to copy
   */
  @api answer;

  labels = {
    copy,
    copied,
  };
  isSelected = false;
  tooltip = this.labels.copy;

  dispatchCopyToClipboardEvent(option) {
    this.dispatchEvent(
      new CustomEvent('quantic__generatedanswercopy', {
        detail: option,
        bubbles: true,
      })
    );
  }

  handleCopyToClipboard = () => {
    copyToClipboard(this.answer)
      .then(() => {
        this.dispatchCopyToClipboardEvent();
        this.isSelected = true;
        this.tooltip = this.labels.copied;
        this.resetInitialState();
      })
      .catch((err) => {
        console.error('Copy to clipboard action failed.', err);
      });
  };

  /**
   * Resets the initial state after 1000ms.
   */
  resetInitialState() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.tooltip = this.labels.copy;
      this.isSelected = false;
    }, 1000);
  }
}

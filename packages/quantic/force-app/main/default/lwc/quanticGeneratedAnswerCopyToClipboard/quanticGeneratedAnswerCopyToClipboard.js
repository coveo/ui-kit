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
  * @type {string}
   */
  @api answer = '';

  /**
   * The size of the copy icon.
   * @api
   * @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'}
   */
  @api
  get size() {
    return this._size;
  }
  set size(value) {
    if (['xx-small', 'x-small', 'small', 'medium', 'large'].includes(value)) {
      this._size = value;
    }
  }

  /** @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'} */
  _size = 'xx-small';

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

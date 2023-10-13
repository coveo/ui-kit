import explainWhy from '@salesforce/label/c.quantic_ExplainWhy';
import no from '@salesforce/label/c.quantic_No';
import wasThisUseful from '@salesforce/label/c.quantic_WasThisUseful';
import yes from '@salesforce/label/c.quantic_Yes';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticFeedback` component displays a question and two buttons for giving positive or negative feedback.
 * @fires CustomEvent#like
 * @fires CustomEvent#dislike
 * @fires CustomEvent#pressExplainWhy
 * @category Search
 * @category Insight Panel
 */
export default class QuanticFeedback extends LightningElement {
  labels = {
    yes,
    no,
    wasThisUseful,
    explainWhy,
  };

  /**
   * The question to be displayed.
   * @api
   * @type {string}
   * @defaultValue `"Was this useful?"`
   */
  @api question = this.labels.wasThisUseful;
  /**
   * The state of the feedback component.
   * @api
   * @type {'neutral' | 'liked' | 'disliked'}
   */
  @api state;
  /**
   * Indicates whether the "Explain why" button should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideExplainWhyButton;
  /**
   * The message to be displayed after submitting a feedback.
   * @api
   * @type {string}
   */
  @api successMessage;
  /**
   * The name of the like icon.
   * @api
   * @type {string}
   */
  @api likeIconName = 'utility:success';
  /**
   * The name of the dislike icon.
   * @api
   * @type {string}
   */
  @api dislikeIconName = 'utility:clear';
  /**
   * The label of the like button.
   * @api
   * @type {string}
   */
  @api likeLabel = this.labels.yes;
  /**
   * The label of the dislike button.
   * @api
   * @type {string}
   */
  @api dislikeLabel = this.labels.no;
  /**
   * Indicates whether the labels of feedback buttons should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideLabels = false;
  /**
   * The size of the feedback icons.
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

  /**
   * Fires the "like" event.
   * @returns {void}
   */
  handleLike() {
    this.dispatchEvent(
      new CustomEvent(`like`, {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Fires the "dislike" event.
   * @returns {void}
   */
  handleDislike() {
    this.dispatchEvent(
      new CustomEvent(`dislike`, {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Fires the "pressexplainwhy" event.
   * @returns {void}
   */
  handlePressExplainWhyButton() {
    this.dispatchEvent(
      new CustomEvent(`pressexplainwhy`, {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Indicates whether the component is in the liked state.
   * @returns {boolean}
   */
  get liked() {
    return this.state === 'liked';
  }

  /**
   * Indicates whether the component is in the disliked state.
   * @returns {boolean}
   */
  get disliked() {
    return this.state === 'disliked';
  }

  /**
   * Returns the variant of the like button icon.
   * @returns {'success' | null}
   */
  get likeIconVariant() {
    return this.liked ? 'success' : null;
  }

  /**
   * Returns the variant of the dislike button icon.
   * @returns {'error' | null}
   */
  get dislikeIconVariant() {
    return this.disliked ? 'error' : null;
  }

  /**
   * Returns the class of the like button icon.
   * @returns {string}
   */
  get likeIconClass() {
    return this.liked ? 'feedback__icon--liked' : '';
  }

  /**
   * Returns the class of the dislike button icon.
   * @returns {string}
   */
  get dislikeIconClass() {
    return this.disliked ? 'feedback__icon--disliked' : '';
  }

  /**
   * Returns the class of the like button.
   * @returns {string}
   */
  get likeButtonClass() {
    return `feedback__like-button slds-button slds-button_icon slds-var-m-right_small ${
      this.liked ? 'feedback__button--liked' : 'feedback__button--neutral'
    } `;
  }

  /**
   * Returns the class of the dislike button.
   * @returns {string}
   */
  get dislikeButtonClass() {
    return `feedback__dislike-button slds-button slds-button_icon ${
      this.disliked ? 'feedback__button--disliked' : 'feedback__button--neutral'
    } `;
  }

  /**
   * Indicates whether the success message should be displayed.
   * @returns {boolean}
   */
  get displaySuccessMessage() {
    return (
      (!!this.successMessage || !this.hideExplainWhyButton) &&
      this.state !== 'neutral'
    );
  }
}

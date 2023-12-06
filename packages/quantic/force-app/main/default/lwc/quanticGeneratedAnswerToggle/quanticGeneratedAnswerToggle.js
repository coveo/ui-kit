import generatedAnswerOff from '@salesforce/label/c.quantic_GeneratedAnswerOff';
import generatedAnswerOn from '@salesforce/label/c.quantic_GeneratedAnswerOn';
import showGeneratedAnswer from '@salesforce/label/c.quantic_ShowGeneratedAnswer';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticGeneratedAnswerToggle` component displays a toggle button responsible for displaying or hiding the generated answer.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-toggle is-generated-answer-visible></c-quantic-c-quantic-generated-answer-toggle>
 */
export default class QuanticGeneratedAnswerToggle extends LightningElement {
  /**
   * Indicates whether the generated answer is visible.
   * @api
   * @type {boolean}
   */
  @api isGeneratedAnswerVisible;

  labels = {
    showGeneratedAnswer,
    generatedAnswerOn,
    generatedAnswerOff,
  };

  handleMouseEnter() {
    this.tooltipComponent.showTooltip();
  }

  handleMouseLeave() {
    this.tooltipComponent.hideTooltip();
  }

  toggleGeneratedAnswer() {
    this.dispatchEvent(
      new CustomEvent('quantic__generatedanswertoggle', {
        bubbles: true,
      })
    );
  }

  /**
   * @returns {Object}
   */
  get tooltipComponent() {
    return this.template.querySelector('c-quantic-tooltip');
  }

  get generatedAnswerToggleTooltip() {
    return this.isGeneratedAnswerVisible
      ? this.labels.generatedAnswerOn
      : this.labels.generatedAnswerOff;
  }
}

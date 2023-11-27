import showGeneratedAnswer from '@salesforce/label/c.quantic_ShowGeneratedAnswer';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticGeneratedAnswerToggle` component displays a toggle button responsible for displaying or hiding the generated answer.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-toggle></c-quantic-c-quantic-generated-answer-toggle>
 */
export default class QuanticGeneratedAnswerToggle extends LightningElement {
  @api isGeneratedAnswerVisible;
  labels = {
    showGeneratedAnswer,
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
}

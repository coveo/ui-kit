import bulletPointSummary from '@salesforce/label/c.quantic_BulletPointSummary';
import bullets from '@salesforce/label/c.quantic_Bullets';
import rephrase from '@salesforce/label/c.quantic_Rephrase';
import stepByStepInstructions from '@salesforce/label/c.quantic_StepByStepInstructions';
import steps from '@salesforce/label/c.quantic_Steps';
import summary from '@salesforce/label/c.quantic_Summary';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticGeneratedAnswerRephraseButtons` component displays a set of rephrase buttons allowing the modification of the answer style of the generated answer.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-rephrase-buttons value={value}"></c-quantic-generated-answer-rephrase-buttons>
 */
export default class QuanticGeneratedAnswerRephraseButtons extends LightningElement {
  /**
   * The value of th rephrase button that should be selected.
   * @api
   * @type {string}
   */
  @api value;
  /**
   * Indicates whether the labels of the rephrase buttons should be hidden.
   * @api
   * @type {boolean}
   */
  @api hideLabels;

  labels = {
    steps,
    rephrase,
    stepByStepInstructions,
    bulletPointSummary,
    bullets,
    summary,
  };

  rephraseButtonLabels = {
    step: this.labels.steps,
    bullet: this.labels.bullets,
    concise: this.labels.summary,
  };

  options = [
    {
      tooltip: this.labels.stepByStepInstructions,
      value: 'step',
      iconName: 'utility:richtextnumberedlist',
    },
    {
      tooltip: this.labels.bulletPointSummary,
      value: 'bullet',
      iconName: 'utility:picklist_type',
    },
    {
      tooltip: this.labels.summary,
      value: 'concise',
      iconName: 'utility:light_bulb',
    },
  ];

  get rephraseOptions() {
    return this.options.map((option) => ({
      ...option,
      label: this.getRephraseButtonLabel(option.value),
      isSelected: this.isSelected(option.value),
      handleSelect: (event) => {
        event.stopPropagation();
        this.handleRephrase(option.value);
      },
    }));
  }

  isSelected(option) {
    return this.value === option;
  }

  handleRephrase(optionValue) {
    this.dispatchEvent(
      new CustomEvent('quantic__generatedanswerrephrase', {
        detail: optionValue,
        bubbles: true,
      })
    );
  }

  handleDeselect(event) {
    event.stopPropagation();
    this.handleRephrase('default');
  }

  getRephraseButtonLabel(option) {
    if (this.hideLabels) {
      return '';
    }
    return this.rephraseButtonLabels[option];
  }
}

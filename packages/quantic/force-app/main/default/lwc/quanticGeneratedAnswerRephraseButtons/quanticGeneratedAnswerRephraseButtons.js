import auto from '@salesforce/label/c.quantic_Auto';
import automatic from '@salesforce/label/c.quantic_Automatic';
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
   * The value of the rephrase button that should be selected.
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
    auto,
    automatic,
    steps,
    rephrase,
    stepByStepInstructions,
    bulletPointSummary,
    bullets,
    summary,
  };

  rephraseButtonLabels = {
    default: this.labels.auto,
    step: this.labels.steps,
    bullet: this.labels.bullets,
    concise: this.labels.summary,
  };

  options = [
    {
      tooltip: this.labels.automatic,
      value: 'default',
      iconName: 'utility:rows',
      default: true,
    },
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
      value: option.value,
      label: this.rephraseButtonLabels[option.value],
      iconName: option.iconName,
      tooltip: option.tooltip,
      defaultSelected: option.default,
    }));
  }

  // get rephraseOptions() {
  //   return this.options.map((option) => ({
  //     ...option,
  //     label: this.getRephraseButtonLabel(option.value),
  //     isSelected: this.isSelected(option.value),
  //     handleSelect: (event) => {
  //       event.stopPropagation();
  //       if(!this.isSelected(option.value)) {
  //         this.handleRephrase(option.value);
  //       }
  //     },
  //   }));
  // }

  isSelected(option) {
    return this.value === option;
  }

  handleRephraseChange(event) {
    event.stopPropagation();
    if (!this.isSelected(event.detail.value)) {
      this.handleRephrase(event.detail.value);
    }
  }

  handleRephrase(optionValue) {
    this.dispatchEvent(
      new CustomEvent('quantic__generatedanswerrephrase', {
        detail: optionValue,
        bubbles: true,
      })
    );
  }

  getRephraseButtonLabel(option) {
    if (this.hideLabels) {
      return '';
    }
    return this.rephraseButtonLabels[option];
  }
}

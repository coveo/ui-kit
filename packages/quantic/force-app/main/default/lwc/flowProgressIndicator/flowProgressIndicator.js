import {api, LightningElement, track} from 'lwc';

/**
 * @typedef ProgressStep
 * @type {Object}
 * @property {String} value
 * @property {String} label
 */

/** @type {ProgressStep[]} */
const DEFAULT_STEPS = [
  {
    label: 'Log in',
    value: 'login',
  },
  {
    label: 'Describe problem',
    value: 'describe',
  },
  {
    label: 'Provide details',
    value: 'details'
  },
  {
    label: 'Review help',
    value: 'review'
  }
];

export default class FlowProgressIndicator extends LightningElement {
  /** @type {ProgressStep[]} */
  @api steps = DEFAULT_STEPS;
  @track currentStepIdx = 0;

  get currentStep() {
    return this.steps[this.currentStepIdx] || 0;
  }

  get hasError() {
    return false;
  }
}

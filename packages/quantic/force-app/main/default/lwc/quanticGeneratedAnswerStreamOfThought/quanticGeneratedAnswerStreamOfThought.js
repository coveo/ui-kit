import analyzingQuestion from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingQuestion';
import analyzingQuestionCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingQuestionCompleted';
import search from '@salesforce/label/c.quantic_AgentGenerationStepSearch';
import searchCompleted from '@salesforce/label/c.quantic_AgentGenerationStepSearchCompleted';
import analyzingResults from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingResults';
import analyzingResultsCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingResultsCompleted';
import answering from '@salesforce/label/c.quantic_AgentGenerationStepAnswering';
import answeringCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnsweringCompleted';
import collapseButton from '@salesforce/label/c.quantic_CollapseButton';
import loadingLabel from '@salesforce/label/c.quantic_Loading';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").GenerationStep} GenerationStep */

/**
 * @typedef {Object} ResolvedStep
 * @property {'thinking-before-search'|'searching'|'thinking-after-search'|'answering'} type
 * @property {'active'|'completed'} status
 */

/** @type {Record<string, {active: string, completed: string}>} */
const STEP_LABEL_KEYS = {
  'thinking-before-search': {
    active: analyzingQuestion,
    completed: analyzingQuestionCompleted,
  },
  searching: {
    active: search,
    completed: searchCompleted,
  },
  'thinking-after-search': {
    active: analyzingResults,
    completed: analyzingResultsCompleted,
  },
  answering: {
    active: answering,
    completed: answeringCompleted,
  },
};

/**
 * Maps an array of raw generation steps to resolved steps with a normalized type.
 * @param {GenerationStep[]} steps
 * @returns {ResolvedStep[]}
 */
export function resolveSteps(steps) {
  let searchWasPerformed = false;
  return steps.map((step) => {
    /** @type {ResolvedStep['type']} */
    let type;
    if (step.name === 'searching') {
      searchWasPerformed = true;
      type = 'searching';
    } else if (step.name === 'answering') {
      type = 'answering';
    } else {
      type = searchWasPerformed
        ? 'thinking-after-search'
        : 'thinking-before-search';
    }
    return {type, status: step.status};
  });
}

/**
 * The `QuanticGeneratedAnswerStreamOfThought` component displays a timeline of agent reasoning
 * steps during answer generation, showing real-time progress and completion status.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-stream-of-thought agent-steps={agentSteps} is-streaming={isStreaming}></c-quantic-generated-answer-stream-of-thought>
 */
export default class QuanticGeneratedAnswerStreamOfThought extends LightningElement {
  /**
   * Array of raw generation steps from the headless engine state.
   * @api
   * @type {GenerationStep[]}
   * @default []
   */
  @api agentSteps = [];

  /**
   * Whether answer generation is currently active.
   * @api
   * @type {boolean}
   * @default false
   */
  @api
  get isStreaming() {
    return this._isStreaming;
  }
  set isStreaming(value) {
    this._isStreaming = value;
    this._expanded = value;
  }

  /** @type {boolean} */
  _isStreaming = false;
  /** @type {boolean} */
  _expanded = true;

  labels = {
    collapse: collapseButton,
    loading: loadingLabel,
  };

  handleToggle = () => {
    this._expanded = !this._expanded;
  };

  /** @returns {Array<{key: number, isActive: boolean, label: string}>} */
  get resolvedSteps() {
    return this.steps.map((step, index) => {
      const labelKey = STEP_LABEL_KEYS[step.type][step.status];
      return {
        key: index,
        isActive: step.status === 'active',
        label: labelKey,
      };
    });
  }

  /** @returns {ResolvedStep[]} */
  get steps() {
    return resolveSteps(this.agentSteps ?? []);
  }

  /** @returns {boolean} */
  get hasSteps() {
    return this.steps.length > 0;
  }

  /** @returns {boolean} */
  get isCollapsible() {
    return this.steps.length > 1;
  }

  /** @returns {boolean} */
  get showCollapsed() {
    return !this._isStreaming && !this._expanded && this.isCollapsible;
  }

  /** @returns {boolean} */
  get showExpandedToggle() {
    return !this._isStreaming && this._expanded && this.isCollapsible;
  }

  /** @returns {string} */
  get collapsedSummaryLabel() {
    const lastStep = this.steps[this.steps.length - 1];
    const labelKey = STEP_LABEL_KEYS[lastStep.type].completed;
    return labelKey;
  }
}

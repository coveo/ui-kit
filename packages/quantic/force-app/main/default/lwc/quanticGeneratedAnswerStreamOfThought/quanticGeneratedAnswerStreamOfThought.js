import analyzingQuestion from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingQuestion';
import analyzingQuestionCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingQuestionCompleted';
import search from '@salesforce/label/c.quantic_AgentGenerationStepSearch';
import searchCompleted from '@salesforce/label/c.quantic_AgentGenerationStepSearchCompleted';
import searchQuery from '@salesforce/label/c.quantic_AgentGenerationStepSearchQuery';
import searchQueryCompleted from '@salesforce/label/c.quantic_AgentGenerationStepSearchQueryCompleted';
import analyzingResults from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingResults';
import analyzingResultsCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnalyzingResultsCompleted';
import answering from '@salesforce/label/c.quantic_AgentGenerationStepAnswering';
import answeringCompleted from '@salesforce/label/c.quantic_AgentGenerationStepAnsweringCompleted';
import collapseButton from '@salesforce/label/c.quantic_CollapseButton';
import loadingLabel from '@salesforce/label/c.quantic_Loading';
import {I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
import {resolveSteps} from './stepsUtils.js';
// @ts-ignore
import streamOfThoughtTemplate from './templates/streamOfThought.html';
// @ts-ignore
import collapsedSummaryTemplate from './templates/collapsedSummary.html';

/** @typedef {import("coveo").GenerationStep} GenerationStep */
/** @typedef {import("./stepsUtils.js").ResolvedStepName} ResolvedStepName */
/** @typedef {import("./stepsUtils.js").ResolvedStep} ResolvedStep */

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
  'searching-with-query': {
    active: searchQuery,
    completed: searchQueryCompleted,
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

  /** @returns {Array<{key: number, name: ResolvedStepName, isActive: boolean, label: string}>} */
  get stepsToDisplay() {
    return this.steps.map((step, index) => {
      const rawLabel = STEP_LABEL_KEYS[step.name][step.status];
      const label =
        step.name === 'searching-with-query'
          ? I18nUtils.format(rawLabel, step.searchQuery)
          : rawLabel;
      return {
        key: index,
        name: step.name,
        isActive: step.status === 'active',
        label,
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
  get shouldShowCollapsedSummary() {
    return !this._isStreaming && !this._expanded && this.isCollapsible;
  }

  /** @returns {boolean} */
  get shouldShowCollapseButton() {
    return !this._isStreaming && this._expanded && this.isCollapsible;
  }

  /** @returns {string} */
  get collapsedSummaryLabel() {
    const lastStep = this.steps[this.steps.length - 1];
    const rawLabel = STEP_LABEL_KEYS[lastStep.name].completed;
    return lastStep.name === 'searching-with-query'
      ? I18nUtils.format(rawLabel, lastStep.searchQuery)
      : rawLabel;
  }

  render() {
    if (this.shouldShowCollapsedSummary) return collapsedSummaryTemplate;
    return streamOfThoughtTemplate;
  }
}

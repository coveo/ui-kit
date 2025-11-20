import {
  buildMultiturnConversation,
  type MultiturnConversation,
  type MultiturnConversationState,
} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';

export interface RelatedQuestion {
  id: string;
  question: string;
}

// const sampleRelatedQuestions = [
//   {
//     id: '1',
//     question: 'What is a query pipeline?',
//   },
//   {
//     id: '2',
//     question: 'What is a query?',
//   },
//   {
//     id: '3',
//     question: 'What is Coveo Relevance Index?',
//   }
// ];

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ai-related-questions': AtomicAiRelatedQuestions;
  }
}

/**
 * The `atomic-ai-related-questions` component displays a list of related questions that can be clicked to trigger new AI generation requests.
 *
 * @part questions-container - The main container for the related questions
 * @part questions-title - The title "Related questions"
 * @part question-item - Each individual question item
 * @part question-button - The clickable question button
 * @part question-text - The question text
 */
@customElement('atomic-ai-related-questions')
@bindings()
@withTailwindStyles
export class AtomicAiRelatedQuestions
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state()
  bindings!: Bindings;
  @state() error!: Error;

  public multiTurnConversation!: MultiturnConversation;

  @bindStateToController('multiTurnConversation')
  @state()
  public conversationState!: MultiturnConversationState;

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .questions-container {
      padding: 0;
    }

    .questions-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 2rem 0;
    }

    .question-item {
      border-bottom: 1px solid #e5e5e5;
      padding: 1.25rem 0;
    }

    .question-item:last-child {
      border-bottom: none;
    }

    .question-button {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: none;
      border: none;
      padding: 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: #666;
      text-align: left;
      cursor: pointer;
      line-height: 1.5;
    }

    .question-button:hover {
      color: #333;
    }

    .question-text {
      flex: 1;
      margin-right: 1rem;
    }

    .question-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      color: #999;
      transition: transform 0.2s ease;
    }

    .question-icon svg {
      width: 100%;
      height: 100%;
    }

    .question-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .question-button:disabled .question-icon {
      opacity: 0.4;
    }

    .plus-icon {
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }
  `;

  /**
   * The answer configuration ID to use for AI conversations.
   */
  @property({type: String, attribute: 'answer-configuration-id'})
  answerConfigurationId = '';

  /**
   * The array of related questions to display
   */
  @property({type: Array, attribute: false})
  questions: RelatedQuestion[] = [];

  public initialize() {
    if (this.answerConfigurationId) {
      this.multiTurnConversation = buildMultiturnConversation(
        this.bindings.engine,
        {
          answerConfigurationId: this.answerConfigurationId,
        }
      );
    }
  }

  private async handleQuestionClick(question: RelatedQuestion) {
    if (!this.multiTurnConversation) {
      return;
    }

    try {
      this.multiTurnConversation.generateAnswerForPrompt(question.question);
    } catch (error) {
      console.error('Failed to ask question:', error);
      this.error = error as Error;
    }
  }

  @errorGuard()
  render() {
    const questionsToRender = this.questions || [];
    if (questionsToRender.length === 0) {
      return html``;
    }

    // Check if any answer is currently loading
    const isLoading =
      this.conversationState?.answers?.some((answer) => answer.isLoading) ||
      false;

    return html`
      <div part="questions-container" class="questions-container">
        <h3 part="questions-title" class="questions-title">Related questions</h3>
        <div>
          ${questionsToRender.map((question) => this.renderQuestion(question, isLoading))}
        </div>
      </div>
    `;
  }

  private renderQuestion(question: RelatedQuestion, isLoading: boolean) {
    return html`
      <div part="question-item" class="question-item">
        <button
          part="question-button"
          class="question-button"
          @click=${() => this.handleQuestionClick(question)}
          ?disabled=${isLoading}
          aria-label="Ask question: ${question.question}"
        >
          <span part="question-text" class="question-text">
            ${question.question}
          </span>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ai-related-questions': AtomicAiRelatedQuestions;
  }
}

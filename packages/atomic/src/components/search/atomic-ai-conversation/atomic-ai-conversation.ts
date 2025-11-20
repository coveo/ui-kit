import {Schema, StringValue} from '@coveo/bueno';
import {
  buildMultiturnConversation,
  type MultiturnConversation,
  type MultiturnConversationState,
} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import '../atomic-ai-citation-list/atomic-ai-citation-list';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {renderGeneratedAnswerActions} from '../../common/generated-answer/atomic-generated-answer-actions/atomic-generated-answer-actions';
import {renderAtomicGeneratedContent} from '../../common/generated-answer/generated-content/lit/atomic-generated-content';
import {renderGeneratedTextStatus} from '../../common/generated-answer/generated-content/lit/generated-text-status';

/**
 * The `atomic-ai-conversation` provides buttons that allow the end user to navigate through the different result pages.
 *
 * @part buttons - The list of the next/previous buttons and page-buttons.
 * @part page-buttons - The list of page buttons.
 * @part page-button - The individual page buttons.
 * @part active-page-button - The active page button.
 * @part previous-button - The previous page button.
 * @part next-button - The next page button.
 * @part previous-button-icon - The icon displayed on the "previous page" button.
 * @part next-button-icon - The icon displayed on the "next page" button.
 *
 * @event atomic/scrollToTop - Emitted when the user clicks any of the buttons rendered by the component.
 */
@customElement('atomic-ai-conversation')
@bindings()
@withTailwindStyles
export class AtomicAiConversation
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  private static propsSchema = new Schema({
    answerConfigurationId: new StringValue(),
  });

  @state()
  bindings!: Bindings;
  @state() error!: Error;

  public multiTurnConversation!: MultiturnConversation;

  @bindStateToController('multiTurnConversation')
  @state()
  public multiTurnConversationState!: MultiturnConversationState;

  @state() currentPrompt = '';
  @state() isLoading = true;
  @state() isOptimizing = false;
  @state() isStreaming = false;

  /**
   * The answer configuration ID.
   */
  @property({
    reflect: true,
    attribute: 'answer-configuration-id',
    type: String,
  })
  answerConfigurationId: string = '';

  static styles = css`
    .container {
      /* width: 1050px; */
      /* height: 800px; */
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1 1 auto; /* grows to fill available space */
      overflow-y: auto; /* scroll if content is too tall */
      padding: 16px;
    }

    .bottom {
      flex-shrink: 0; /* never shrink */
      background: white;
    }
  `;

  public initialize() {
    this.validateProps();
    this.multiTurnConversation = buildMultiturnConversation(
      this.bindings.engine,
      {
        answerConfigurationId: this.answerConfigurationId,
      }
    );
  }

  handleInputChange(e: Event) {
    this.currentPrompt = (e.target as HTMLInputElement).value;
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.submitPrompt();
    }
  }

  simulateAnswerStreaming() {
    setTimeout(() => {
      this.isLoading = false;
      this.isOptimizing = true;
    }, 1500);

    setTimeout(() => {
      this.isOptimizing = false;
      this.isStreaming = true;
    }, 3000);

    setTimeout(() => {
      this.isStreaming = false;
    }, 5000);
  }

  submitPrompt() {
    this.multiTurnConversation.generateAnswerForPrompt(this.currentPrompt);
    this.currentPrompt = '';
    this.simulateAnswerStreaming();
  }

  renderAnswer(answer: MultiturnConversation['state']['answers'][0]) {
    return html` <div
      class="mt-2 text-black rounded-[16px_16px_16px_4px] max-w-[70%] break-words px-4 py-3"
    >
      ${renderAtomicGeneratedContent({
        props: {
          answer: answer.answer,
          isStreaming: answer.isStreaming,
          answerContentFormat: answer.answerContentFormat,
        },
      })}
      ${
        !answer.isStreaming
          ? renderGeneratedAnswerActions({
              props: {
                answer: answer.answer,
                isLiked: false,
                onLike: () => {},
                isDisliked: false,
                onDislike: () => {},
              },
            })
          : nothing
      }
    </div>`;
  }

  renderPrompt(answer: MultiturnConversation['state']['answers'][0]) {
    return html` <div
      class="bg-gray-100 rounded-[24px_4px_24px_24px] ml-auto max-w-[400px] px-4 py-3 break-words"
    >
      ${answer.prompt}
    </div>`;
  }

  renderConversationInput() {
    return html` <div class="relative w-full mx-auto">
      <textarea
        class="w-full h-24 p-4 pr-20 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
        .value=${this.currentPrompt}
        @input=${this.handleInputChange}
      ></textarea>

      <button
        class="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        @click=${this.submitPrompt}
      >
        Send
      </button>
    </div>`;
  }

  renderInitialState() {
    return html`
      <div class="container">
        <div class="text-4xl font-normal text-center mb-3">
          Meet Coveo AI Mode
        </div>

        <div class="text-gray-500 font-normal text-center mb-8">
          Ask detailed questions for better responses
        </div>

        <div class="relative w-full mx-auto">
          <textarea
            class="w-full h-32 p-4 pr-20 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question..."
            .value=${this.currentPrompt}
            @input=${this.handleInputChange}
          ></textarea>

          <button
            class="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            @click=${this.submitPrompt}
          >
            Send
          </button>
        </div>
      </div>
    `;
  }

  renderConversation() {
    const answers = this.multiTurnConversationState.answers;
    return html`
      <div class=" relative container">
        <div class="h-full content">
          ${answers.map(
            (answer) => html`
              <div class="flex mb-6" .key=${answer.prompt}>
                <div class="flex-col flex-3 p-4">
                  ${this.renderPrompt(answer)}
                  ${
                    answer.answer?.length &&
                    !this.isStreaming &&
                    !this.isLoading &&
                    !this.isOptimizing
                      ? this.renderAnswer(answer)
                      : html`<p
                        part="generated-text"
                        class="text-on-background mb-0 mt-4"
                      >
                        ${renderGeneratedTextStatus({
                          isLoading: this.isLoading,
                          isStreaming: this.isStreaming,
                          isOptimizing: this.isOptimizing,
                        })}
                      </p>`
                  }
                </div>
                <div class="flex-col flex-1 p-4">
                  <atomic-ai-citation-list
                    .citations=${answer.citations}
                  ></atomic-ai-citation-list>
                </div>
              </div>
            `
          )}
        </div>
        <div class="bottom w-full ">
          <div class="w-2/3 p-4">${this.renderConversationInput()}</div>
        </div>
      </div>
    `;
  }

  @query('.content')
  private contentDiv!: HTMLElement;

  updated() {
    // scroll to bottom whenever the component updates
    if (this.contentDiv) {
      this.contentDiv.scrollTop = this.contentDiv.scrollHeight;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (!this.multiTurnConversationState.answers.length) {
      return this.renderInitialState();
    }
    return this.renderConversation();
  }

  private validateProps() {
    try {
      AtomicAiConversation.propsSchema.validate({
        answerConfigurationId: this.answerConfigurationId,
      });
    } catch (error) {
      this.error = error as Error;
      return;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ai-conversation': AtomicAiConversation;
  }
}

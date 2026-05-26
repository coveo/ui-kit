import {
  buildInteractiveGeneratedAnswerInlineLink,
  type InteractiveGeneratedAnswerInlineLink,
  type SearchEngine,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import styles from './atomic-generated-answer-inline-link.tw.css.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {consume} from '@lit/context';
import {answerContext} from '../atomic-generated-answer-content/answer-context';

/**
 * The `atomic-generated-answer-inline-link` component renders a link within generated answer content.
 * It builds its own headless `InteractiveGeneratedAnswerInlineLink` controller to log analytics events when the link is interacted with.
 *
 * @part answer-link - The anchor element.
 * @part answer-link-text - The text content of the anchor element.
 * @part answer-link-icon - The icon indicating the link opens in a new tab.
 * @internal
 */
@customElement('atomic-generated-answer-inline-link')
@bindings()
export class AtomicGeneratedAnswerInlineLink
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = styles;

  @consume({context: answerContext})
  answerId!: string | null;

  @state() public bindings!: AnyBindings;
  @state() public error!: Error;
  public initialized = false;

  @property({reflect: true})
  href = '';

  @property({reflect: true})
  title = '';

  private interactiveLink?: InteractiveGeneratedAnswerInlineLink;

  public initialize() {
    if (this.answerId && this.href) {
      this.interactiveLink = buildInteractiveGeneratedAnswerInlineLink(
        this.bindings.engine as SearchEngine,
        {
          options: {
            answerId: this.answerId,
            link: {
              linkText: this.textContent?.trim() || '',
              linkURL: this.href,
            },
          },
        }
      );
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      <a
        part="answer-link"
        href=${this.href}
        title=${ifDefined(this.title || undefined)}
        target="_blank"
        rel="noopener noreferrer"
        @click=${this.handleSelect}
        @contextmenu=${this.handleSelect}
        @mousedown=${this.handleSelect}
        @mouseup=${this.handleSelect}
        @touchstart=${this.handleBeginDelayedSelect}
        @touchend=${this.handleCancelPendingSelect}
      >
        <span part="answer-link-text"><slot></slot></span>
        <span class="icon-wrapper">
          <svg
            part="answer-link-icon"
            width="100%"
            height="100%"
            viewBox="0 0 640 640"
            aria-hidden="true"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M354.4 83.8C359.4 71.8 371.1 64 384 64L544 64C561.7 64 576 78.3 576 96L576 256C576 268.9 568.2 280.6 556.2 285.6C544.2 290.6 530.5 287.8 521.3 278.7L464 221.3L310.6 374.6C298.1 387.1 277.8 387.1 265.3 374.6C252.8 362.1 252.8 341.8 265.3 329.3L418.7 176L361.4 118.6C352.2 109.4 349.5 95.7 354.5 83.7zM64 240C64 195.8 99.8 160 144 160L224 160C241.7 160 256 174.3 256 192C256 209.7 241.7 224 224 224L144 224C135.2 224 128 231.2 128 240L128 496C128 504.8 135.2 512 144 512L400 512C408.8 512 416 504.8 416 496L416 416C416 398.3 430.3 384 448 384C465.7 384 480 398.3 480 416L480 496C480 540.2 444.2 576 400 576L144 576C99.8 576 64 540.2 64 496L64 240z"
            />
          </svg>
        </span>
      </a>
    `;
  }

  private handleSelect() {
    this.interactiveLink?.select();
  }

  private handleBeginDelayedSelect() {
    this.interactiveLink?.beginDelayedSelect();
  }

  private handleCancelPendingSelect() {
    this.interactiveLink?.cancelPendingSelect();
  }
}

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

/**
 * The `atomic-generated-answer-inline-link` component renders a link within generated answer content.
 * It builds its own headless `InteractiveGeneratedAnswerInlineLink` controller to log analytics events when the link is interacted with.
 *
 * @part answer-link - The anchor element.
 * @internal
 */
@customElement('atomic-generated-answer-inline-link')
@bindings()
export class AtomicGeneratedAnswerInlineLink
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = styles;

  @state() public bindings!: AnyBindings;
  @state() public error!: Error;
  public initialized = false;

  @property({reflect: true})
  href = '';

  @property({reflect: true})
  text = '';

  @property({reflect: true})
  title = '';

  @property({attribute: 'answer-id'})
  answerId = '';

  private interactiveLink?: InteractiveGeneratedAnswerInlineLink;

  public initialize() {
    if (this.answerId && this.href) {
      this.interactiveLink = buildInteractiveGeneratedAnswerInlineLink(
        this.bindings.engine as SearchEngine,
        {
          options: {
            answerId: this.answerId,
            link: {
              linkText: this.text.trim(),
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
        ${this.text}
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

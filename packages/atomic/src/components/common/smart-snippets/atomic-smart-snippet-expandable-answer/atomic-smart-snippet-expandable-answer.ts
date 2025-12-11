import type {InlineLink} from '@coveo/headless';
import {css, html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings.js';
import {bindings} from '@/src/decorators/bindings.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import ArrowDown from '@/src/images/arrow-down.svg';
import {listenOnce} from '@/src/utils/event-utils.js';

/**
 * The `atomic-smart-snippet-expandable-answer` component displays an expandable smart snippet answer.
 * @internal
 *
 * @part truncated-answer - The container for the truncated answer content.
 * @part show-more-button - The button to expand the answer when collapsed.
 * @part show-less-button - The button to collapse the answer when expanded.
 */
@customElement('atomic-smart-snippet-expandable-answer')
@bindings()
@withTailwindStyles
export class AtomicSmartSnippetExpandableAnswer
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = [
    css`
      atomic-smart-snippet-answer {
        font-size: var(--atomic-font-size-lg, 1rem);
        line-height: var(--atomic-line-height-lg, 1.5);
        display: block;
        overflow: hidden;
        height: var(--collapsed-size);

        --gradient-start: var(
          --atomic-smart-snippet-gradient-start,
          calc(max(var(--collapsed-size) - (var(--line-height) * 1.5), var(--collapsed-size) * 0.5))
        );
        color: var(--atomic-on-background);
        mask-image: linear-gradient(black, black var(--gradient-start), transparent 100%);
      }

      atomic-smart-snippet-answer.loaded {
        transition: height ease-in-out 0.25s;
      }

      button atomic-icon {
        position: relative;
        top: 0.125rem;
      }

      .expanded atomic-smart-snippet-answer {
        height: var(--full-height);
        mask-image: none;
      }

      .expanded button atomic-icon {
        top: 0;
        transform: scaleY(-1);
      }
    `,
  ];

  @state()
  bindings!: AnyBindings;

  @state()
  public error!: Error;

  @property({type: Boolean, reflect: true})
  expanded!: boolean;

  @property({type: String})
  htmlContent!: string;

  /**
   * The maximum height (in pixels) a snippet can have before the component truncates it and displays a "show more" button.
   */
  @property({type: Number, reflect: true})
  maximumHeight = 250;

  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @property({type: Number, reflect: true})
  collapsedHeight = 180;

  /**
   * Sets the style of the snippet.
   *
   * Example:
   * ```ts
   * expandableAnswer.snippetStyle = `
   *   b {
   *     color: blue;
   *   }
   * `;
   * ```
   */
  @property({type: String})
  snippetStyle?: string;

  @state()
  private fullHeight?: number;

  private validateProps() {
    if (this.maximumHeight < this.collapsedHeight) {
      throw new Error(
        'maximumHeight must be equal or greater than collapsedHeight'
      );
    }
  }

  public initialize() {
    this.validateProps();
  }

  private get showButton() {
    return (
      this.fullHeight !== undefined && this.fullHeight > this.maximumHeight
    );
  }

  private get isExpanded() {
    return this.expanded || !this.showButton;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('fullHeight')) {
      this.style.setProperty('--full-height', `${this.fullHeight}px`);
      this.style.setProperty(
        '--collapsed-size',
        `${this.showButton ? this.collapsedHeight : this.fullHeight}px`
      );
    }
  }

  protected async firstUpdated(): Promise<void> {
    super.firstUpdated();
    this.fullHeight = await this.establishInitialHeight();
  }

  private async establishInitialHeight(): Promise<number> {
    const answerElement = document.createElement(
      'atomic-smart-snippet-answer'
    ) as HTMLElement & {htmlContent: string; innerStyle?: string};
    answerElement.htmlContent = this.htmlContent;
    answerElement.innerStyle = this.snippetStyle;
    answerElement.style.visibility = 'hidden';
    answerElement.style.position = 'absolute';

    return new Promise<number>((resolve) => {
      listenOnce(answerElement, 'answerSizeUpdated', (event) => {
        answerElement.remove();
        resolve((event as CustomEvent<{height: number}>).detail.height);
      });
      this.parentElement!.appendChild(answerElement);
    });
  }

  private handleExpand() {
    this.dispatchEvent(
      new CustomEvent('expand', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleCollapse() {
    this.dispatchEvent(
      new CustomEvent('collapse', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(
      new CustomEvent('selectInlineLink', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleBeginDelayedSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(
      new CustomEvent('beginDelayedSelectInlineLink', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleCancelPendingSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(
      new CustomEvent('cancelPendingSelectInlineLink', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderAnswer() {
    return html`
      <div part="truncated-answer">
        <atomic-smart-snippet-answer
          exportparts="answer"
          .htmlContent=${this.htmlContent}
          .innerStyle=${this.snippetStyle}
          @answerSizeUpdated=${(e: CustomEvent<{height: number}>) => {
            this.fullHeight = e.detail.height;
          }}
          @selectInlineLink=${this.handleSelectInlineLink}
          @beginDelayedSelectInlineLink=${
            this.handleBeginDelayedSelectInlineLink
          }
          @cancelPendingSelectInlineLink=${
            this.handleCancelPendingSelectInlineLink
          }
        ></atomic-smart-snippet-answer>
      </div>
    `;
  }

  private renderButton() {
    return when(
      this.showButton,
      () => html`
        <button
          @click=${() =>
            this.isExpanded ? this.handleCollapse() : this.handleExpand()}
          class="text-primary mb-4 hover:underline"
          part=${this.isExpanded ? 'show-less-button' : 'show-more-button'}
        >
          ${this.bindings.i18n.t(this.isExpanded ? 'show-less' : 'show-more')}
          <atomic-icon
            .icon=${ArrowDown}
            class="ml-2 w-3 align-baseline"
          ></atomic-icon>
        </button>
      `
    );
  }

  render() {
    return html`
      <div class=${this.isExpanded ? 'expanded' : ''}>
        ${this.renderAnswer()} ${this.renderButton()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-smart-snippet-expandable-answer': AtomicSmartSnippetExpandableAnswer;
  }
}

import type {InlineLink} from '@coveo/headless';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings.js';
import {booleanConverter} from '@/src/converters/boolean-converter.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import ArrowDown from '@/src/images/arrow-down.svg';
import {buildCustomEvent, listenOnce} from '@/src/utils/event-utils.js';
import styles from './atomic-smart-snippet-expandable-answer.tw.css.js';
import '@/src/components/common/atomic-icon/atomic-icon.js';
import '@/src/components/common/atomic-smart-snippet-answer/atomic-smart-snippet-answer.js';

/**
 * The `atomic-smart-snippet-expandable-answer` component displays an expandable smart snippet answer.
 *
 * @part truncated-answer - The container for the truncated answer content.
 * @part show-more-button - The button to expand the answer when collapsed.
 * @part show-less-button - The button to collapse the answer when expanded.
 *
 * @event expand - Emitted when the answer is expanded.
 * @event collapse - Emitted when the answer is collapsed.
 * @event selectInlineLink - Emitted when an inline link is selected.
 * @event beginDelayedSelectInlineLink - Emitted when a delayed selection begins for an inline link.
 * @event cancelPendingSelectInlineLink - Emitted when a pending selection is canceled for an inline link.
 *
 * @internal
 */
@customElement('atomic-smart-snippet-expandable-answer')
@bindings()
@withTailwindStyles
export class AtomicSmartSnippetExpandableAnswer
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = styles;

  @state()
  bindings!: AnyBindings;

  @state()
  public error!: Error;

  @property({type: Boolean, reflect: true, converter: booleanConverter})
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
        'maximumHeight must be greater than or equal to collapsedHeight'
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

  protected async firstUpdated(
    _changedProperties: PropertyValues
  ): Promise<void> {
    super.firstUpdated(_changedProperties);
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
    this.dispatchEvent(buildCustomEvent('expand'));
  }

  private handleCollapse() {
    this.dispatchEvent(buildCustomEvent('collapse'));
  }

  private handleSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(buildCustomEvent('selectInlineLink', e.detail));
  }

  private handleBeginDelayedSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(
      buildCustomEvent('beginDelayedSelectInlineLink', e.detail)
    );
  }

  private handleCancelPendingSelectInlineLink(e: CustomEvent<InlineLink>) {
    this.dispatchEvent(
      buildCustomEvent('cancelPendingSelectInlineLink', e.detail)
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

  @errorGuard()
  @bindingGuard()
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

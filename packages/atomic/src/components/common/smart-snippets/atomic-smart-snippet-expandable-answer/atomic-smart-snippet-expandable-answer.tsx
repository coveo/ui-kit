import {InlineLink} from '@coveo/headless';
import {
  h,
  Component,
  State,
  Prop,
  Element,
  Watch,
  Event,
  EventEmitter,
} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import {listenOnce} from '../../../../utils/event-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {AnyBindings} from '../../interface/bindings';

/**
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-expandable-answer',
  styleUrl: 'atomic-smart-snippet-expandable-answer.pcss',
  shadow: true,
})
export class AtomicSmartSnippetExpandableAnswer {
  @InitializeBindings() public bindings!: AnyBindings;
  public error!: Error;
  @Element() public host!: HTMLElement;

  @Prop({reflect: true}) expanded!: boolean;
  @Prop() htmlContent!: string;
  /**
   * The maximum height (in pixels) a snippet can have before the component truncates it and displays a "show more" button.
   */
  @Prop({reflect: true}) maximumHeight = 250;
  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @Prop({reflect: true}) collapsedHeight = 180;
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
  @Prop() snippetStyle?: string;

  @State() fullHeight?: number;

  @Event() expand!: EventEmitter;
  @Event() collapse!: EventEmitter;
  @Event() selectInlineLink!: EventEmitter<InlineLink>;
  @Event() beginDelayedSelectInlineLink!: EventEmitter<InlineLink>;
  @Event() cancelPendingSelectInlineLink!: EventEmitter<InlineLink>;

  private validateProps() {
    if (this.maximumHeight < this.collapsedHeight) {
      throw 'maximumHeight must be equal or greater than collapsedHeight';
    }
  }

  public initialize() {
    this.validateProps();
  }

  @Watch('fullHeight')
  public fullHeightUpdated() {
    this.host.style.setProperty('--full-height', `${this.fullHeight}px`);
    this.host.style.setProperty(
      '--collapsed-size',
      `${this.showButton ? this.collapsedHeight : this.fullHeight}px`
    );
  }

  private establishInitialHeight() {
    const answerElement = document.createElement('atomic-smart-snippet-answer');
    answerElement.htmlContent = this.htmlContent;
    answerElement.innerStyle = this.snippetStyle;
    answerElement.style.visibility = 'hidden';
    answerElement.style.position = 'absolute';
    return new Promise<number>((resolve) => {
      listenOnce(answerElement, 'answerSizeUpdated', (event) => {
        answerElement.remove();
        resolve((event as CustomEvent<{height: number}>).detail.height);
      });
      this.host.parentElement!.appendChild(answerElement);
    });
  }

  private get showButton() {
    return this.fullHeight! > this.maximumHeight;
  }

  private get isExpanded() {
    return this.expanded || !this.showButton;
  }

  public async componentWillLoad() {
    this.fullHeight = await this.establishInitialHeight();
  }

  public renderAnswer() {
    return (
      <div part="truncated-answer">
        <atomic-smart-snippet-answer
          exportparts="answer"
          htmlContent={this.htmlContent}
          innerStyle={this.snippetStyle}
          onAnswerSizeUpdated={(e) => (this.fullHeight = e.detail.height)}
          onSelectInlineLink={(e) => this.selectInlineLink.emit(e.detail)}
          onBeginDelayedSelectInlineLink={(e) =>
            this.beginDelayedSelectInlineLink.emit(e.detail)
          }
          onCancelPendingSelectInlineLink={(e) =>
            this.cancelPendingSelectInlineLink.emit(e.detail)
          }
        ></atomic-smart-snippet-answer>
      </div>
    );
  }

  public renderButton() {
    if (!this.showButton) {
      return;
    }
    return (
      <button
        onClick={() =>
          this.isExpanded ? this.collapse.emit() : this.expand.emit()
        }
        class="text-primary mb-4 hover:underline"
        part={this.isExpanded ? 'show-less-button' : 'show-more-button'}
      >
        {this.bindings.i18n.t(this.isExpanded ? 'show-less' : 'show-more')}
        <atomic-icon
          icon={ArrowDown}
          class="ml-2 w-3 align-baseline"
        ></atomic-icon>
      </button>
    );
  }

  public render() {
    return (
      <div class={this.isExpanded ? 'expanded' : ''}>
        {this.renderAnswer()}
        {this.renderButton()}
      </div>
    );
  }
}

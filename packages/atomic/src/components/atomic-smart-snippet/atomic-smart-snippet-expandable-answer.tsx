import {
  h,
  Component,
  State,
  Prop,
  Element,
  Listen,
  Event,
  EventEmitter,
} from '@stencil/core';
import ArrowDown from '../../images/arrow-down.svg';
import {InitializeBindings, Bindings} from '../../utils/initialization-utils';
import {Hidden} from '../common/hidden';

/**
 * @part answer - The container displaying the full document excerpt.
 * @part truncated-answer - The container displaying only part of the answer.
 * @part show-more-button - The show more button.
 * @part show-less-button - The show less button.
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-expandable-answer',
  styleUrl: 'atomic-smart-snippet-expandable-answer.pcss',
  shadow: true,
})
export class AtomicSmartSnippetExpandableAnswer {
  @InitializeBindings() public bindings!: Bindings;
  public error!: Error;
  @Element() public host!: HTMLElement;

  @Prop({reflect: true}) expanded!: boolean;
  @Prop({reflect: true}) htmlContent?: string;
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
  @Prop({reflect: true}) snippetStyle?: string;

  @Event({
    bubbles: false,
  })
  private expand!: EventEmitter<void>;
  @Event({
    bubbles: false,
  })
  private collapse!: EventEmitter<void>;

  @State() showButton = true;

  private validateProps() {
    if (this.maximumHeight < this.collapsedHeight) {
      throw 'maximumHeight must be equal or greater than collapsedHeight';
    }
  }

  public initialize() {
    this.validateProps();
  }

  @Listen('atomic/smartSnippet/answerRendered')
  public answerRendered(event: CustomEvent<{height: number}>) {
    const {height} = event.detail;
    this.host.style.setProperty('--full-height', `${height}px`);
    this.showButton = height > this.maximumHeight;
    this.host.style.setProperty(
      '--collapsed-size',
      `${this.showButton ? this.collapsedHeight : height}px`
    );
  }

  private get showFullSnippet() {
    return this.expanded || !this.showButton;
  }

  public renderAnswer() {
    return (
      <div part="truncated-answer">
        <atomic-smart-snippet-answer
          exportparts="answer"
          htmlContent={this.htmlContent!}
          innerStyle={this.snippetStyle}
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
          this.showFullSnippet ? this.collapse.emit() : this.expand.emit()
        }
        class="text-primary hover:underline mb-4"
        part={this.showFullSnippet ? 'show-less-button' : 'show-more-button'}
      >
        {this.bindings.i18n.t(this.showFullSnippet ? 'show-less' : 'show-more')}
        <atomic-icon icon={ArrowDown} class="w-3 ml-2"></atomic-icon>
      </button>
    );
  }

  public render() {
    if (!this.htmlContent) {
      return <Hidden></Hidden>;
    }
    return (
      <div class={this.showFullSnippet ? 'expanded' : ''}>
        {this.renderAnswer()}
        {this.renderButton()}
      </div>
    );
  }
}

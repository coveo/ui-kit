import {
  buildSmartSnippet,
  SmartSnippet,
  SmartSnippetState,
} from '@coveo/headless';
import {h, Component, State, Prop, Element, Watch} from '@stencil/core';
import ArrowDown from '../../images/arrow-down.svg';
import {listenOnce} from '../../utils/event-utils';
import {
  InitializeBindings,
  Bindings,
  BindStateToController,
} from '../../utils/initialization-utils';
import {Hidden} from '../common/hidden';

/**
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-expandable-answer',
  styleUrl: 'atomic-smart-snippet-expandable-answer.pcss',
  shadow: true,
})
export class AtomicSmartSnippetExpandableAnswer {
  @InitializeBindings() public bindings!: Bindings;
  public smartSnippet!: SmartSnippet;
  @BindStateToController('smartSnippet')
  @State()
  public smartSnippetState!: SmartSnippetState;
  public error!: Error;
  @Element() public host!: HTMLElement;

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

  @State() fullHeight?: number;

  private validateProps() {
    if (this.maximumHeight < this.collapsedHeight) {
      throw 'maximumHeight must be equal or greater than collapsedHeight';
    }
  }

  public initialize() {
    this.validateProps();
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
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
    return new Promise<number>((resolve) => {
      const answerElement = document.createElement(
        'atomic-smart-snippet-answer'
      );
      answerElement.htmlContent = this.smartSnippetState.answer;
      answerElement.innerStyle = this.snippetStyle;
      answerElement.style.visibility = 'hidden';
      answerElement.style.position = 'absolute';
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

  private get expanded() {
    return this.smartSnippetState.expanded || !this.showButton;
  }

  public async componentWillLoad() {
    this.fullHeight = await this.establishInitialHeight();
  }

  public renderAnswer() {
    return (
      <div part="truncated-answer">
        <atomic-smart-snippet-answer
          exportparts="answer"
          htmlContent={this.smartSnippetState.answer}
          innerStyle={this.snippetStyle}
          onAnswerSizeUpdated={(e) => (this.fullHeight = e.detail.height)}
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
          this.expanded
            ? this.smartSnippet.collapse()
            : this.smartSnippet.expand()
        }
        class="text-primary hover:underline mb-4"
        part={this.expanded ? 'show-less-button' : 'show-more-button'}
      >
        {this.bindings.i18n.t(this.expanded ? 'show-less' : 'show-more')}
        <atomic-icon
          icon={ArrowDown}
          class="w-3 ml-2 align-baseline"
        ></atomic-icon>
      </button>
    );
  }

  public render() {
    if (!this.smartSnippetState.answerFound) {
      return <Hidden></Hidden>;
    }
    return (
      <div class={this.expanded ? 'expanded' : ''}>
        {this.renderAnswer()}
        {this.renderButton()}
      </div>
    );
  }
}

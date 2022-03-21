import {
  buildSmartSnippet,
  SmartSnippet,
  SmartSnippetState,
} from '@coveo/headless';
import {h, Component, State, Prop, Element, Listen} from '@stencil/core';
import ArrowDown from '../../images/arrow-down.svg';
import {
  InitializeBindings,
  Bindings,
  BindStateToController,
} from '../../utils/initialization-utils';

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
   * The height (in pixels) which, when exceeded by the snippet, displays a "show more" button and truncates the snippet.
   */
  @Prop({reflect: true}) minimumSnippetHeightForShowMore = 250;
  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @Prop({reflect: true}) answerHeightWhenCollapsed = 180;

  @State() showButton = true;

  private validateProps() {
    if (this.minimumSnippetHeightForShowMore < this.answerHeightWhenCollapsed) {
      throw 'minimumSnippetHeightForShowMore must be equal or greater than answerHeightWhenCollapsed';
    }
  }

  public initialize() {
    this.validateProps();
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
  }

  public async componentWillRender() {
    if (this.error) {
      return;
    }
    if (!this.smartSnippetState.answerFound) {
      throw 'No answer returned by the query';
    }
  }

  @Listen('atomic/smartSnippet/answerRendered')
  public answerRendered(event: CustomEvent<{height: number}>) {
    const {height} = event.detail;
    this.host.style.setProperty('--full-height', `${height}px`);
    this.showButton = height > this.minimumSnippetHeightForShowMore;
    this.host.style.setProperty(
      '--collapsed-size',
      `${this.showButton ? this.answerHeightWhenCollapsed : height}px`
    );
  }

  private get expanded() {
    return this.smartSnippetState.expanded || !this.showButton;
  }

  public renderAnswer() {
    return (
      <div part="truncated-answer">
        <atomic-smart-snippet-answer
          exportparts="answer"
          htmlContent={this.smartSnippetState.answer}
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
        <atomic-icon icon={ArrowDown} class="w-3 ml-2"></atomic-icon>
      </button>
    );
  }

  public render() {
    return (
      <div class={this.expanded ? 'expanded' : ''}>
        {this.renderAnswer()}
        {this.renderButton()}
      </div>
    );
  }
}

import {Component, Prop, State, Element} from '@stencil/core';
import {
  buildInsightSmartSnippet,
  InsightSmartSnippet,
  InsightSmartSnippetState,
} from '../..';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {SmartSnippetCommon} from '../../../common/smart-snippets/atomic-smart-snippet/smart-snippet-common';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-smart-snippet',
  styleUrl: 'atomic-insight-smart-snippet.pcss',
  shadow: true,
})
export class AtomicInsightSmartSnippet
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public smartSnippet!: InsightSmartSnippet;

  @BindStateToController('smartSnippet')
  @State()
  public smartSnippetState!: InsightSmartSnippetState;
  public error!: Error;

  @Element() public host!: HTMLElement;

  private id = randomID();
  private modalRef?: HTMLAtomicSmartSnippetFeedbackModalElement;
  private smartSnippetCommon!: SmartSnippetCommon;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the question at the top of the snippet, from 1 to 5.
   */
  @Prop({reflect: true}) public headingLevel = 0;

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
   * smartSnippet.snippetStyle = `
   *   b {
   *     color: blue;
   *   }
   * `;
   * ```
   */
  @Prop({reflect: true}) snippetStyle?: string;

  @State() feedbackSent = false;

  public initialize() {
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
    this.smartSnippetCommon = new SmartSnippetCommon({
      id: this.id,
      modalTagName: 'atomic-insight-smart-snippet-feedback-modal',
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getModalRef: () => this.modalRef,
      getHeadingLevel: () => this.headingLevel,
      getCollapsedHeight: () => this.collapsedHeight,
      getMaximumHeight: () => this.maximumHeight,
      getSmartSnippetState: () => this.smartSnippetState,
      getSmartSnippet: () => this.smartSnippet,
      getSnippetStyle: () => this.snippetStyle,
      getFeedbackSent: () => this.feedbackSent,
      setModalRef: this.setModalRef.bind(this),
      setFeedbackSent: this.setFeedbackSent.bind(this),
    });
    this.bindings.store.waitUntilAppLoaded(() =>
      this.smartSnippetCommon.hideDuringRender(false)
    );
  }

  private setModalRef(ref: HTMLElement) {
    this.modalRef = ref as HTMLAtomicInsightSmartSnippetFeedbackModalElement;
  }

  private setFeedbackSent(isSent: boolean) {
    this.feedbackSent = isSent;
  }

  public componentWillUpdate() {
    if (!(this.smartSnippetState.liked || this.smartSnippetState.disliked)) {
      this.setFeedbackSent(false);
    }
  }

  public componentDidRender() {
    if (this.bindings.store.isAppLoaded()) {
      this.smartSnippetCommon.hideDuringRender(false);
    }
  }

  public render() {
    return this.smartSnippetCommon.render();
  }
}

import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {SmartSnippetFeedbackBanner} from '@/src/components/common/smart-snippets/stencil-smart-snippet-feedback-banner';
import {
  SmartSnippetFooter,
  SmartSnippetQuestion,
  SmartSnippetWrapper,
} from '@/src/components/common/smart-snippets/atomic-smart-snippet/stencil-smart-snippet-common';
import {Hidden} from '@/src/components/common/stencil-hidden';
import {randomID} from '@/src/utils/utils';
import {
  buildSmartSnippet as buildInsightSmartSnippet,
  SmartSnippet as InsightSmartSnippet,
  SmartSnippetState as InsightSmartSnippetState,
} from '@coveo/headless/insight';
import {Component, Prop, State, Element, h} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
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

  private id!: string;
  private modalRef?: HTMLAtomicSmartSnippetFeedbackModalElement;

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
    this.id ||= randomID();
    this.smartSnippet = buildInsightSmartSnippet(this.bindings.engine);
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

  public render() {
    if (!this.smartSnippetState.answerFound) {
      return <Hidden></Hidden>;
    }

    const source = this.smartSnippetState.source;

    return (
      <SmartSnippetWrapper
        headingLevel={this.headingLevel}
        i18n={this.bindings.i18n}
      >
        <atomic-smart-snippet-collapse-wrapper>
          <SmartSnippetQuestion
            headingLevel={this.headingLevel}
            question={this.smartSnippetState.question}
          />
          <atomic-smart-snippet-expandable-answer
            collapsedHeight={this.collapsedHeight}
            expanded={this.smartSnippetState.expanded}
            exportparts="answer,show-more-button,show-less-button,truncated-answer"
            htmlContent={this.smartSnippetState.answer}
            maximumHeight={this.maximumHeight}
            onCollapse={() => this.smartSnippet.collapse()}
            onExpand={() => this.smartSnippet.expand()}
            part="body"
            snippetStyle={this.style}
          ></atomic-smart-snippet-expandable-answer>
          <SmartSnippetFooter i18n={this.bindings.i18n}>
            {source && (
              <atomic-smart-snippet-source
                anchorAttributes={getAttributesFromLinkSlotContent(
                  this.host,
                  'source-anchor-attributes'
                )}
                onBeginDelayedSelectSource={
                  this.smartSnippet.beginDelayedSelectSource
                }
                onCancelPendingSelectSource={
                  this.smartSnippet.cancelPendingSelectSource
                }
                onSelectSource={this.smartSnippet.selectSource}
                source={source}
              ></atomic-smart-snippet-source>
            )}
            <SmartSnippetFeedbackBanner
              disliked={this.smartSnippetState.disliked}
              explainWhyRef={(button) => {
                if (this.modalRef) {
                  this.modalRef.source = button;
                }
              }}
              feedbackSent={this.feedbackSent}
              id={this.id}
              i18n={this.bindings.i18n}
              liked={this.smartSnippetState.liked}
              onDislike={() => {
                this.loadModal();
                this.smartSnippet.dislike();
              }}
              onLike={() => this.smartSnippet.like()}
              onPressExplainWhy={() => (this.modalRef!.isOpen = true)}
            ></SmartSnippetFeedbackBanner>
          </SmartSnippetFooter>
        </atomic-smart-snippet-collapse-wrapper>
      </SmartSnippetWrapper>
    );
  }

  private get style() {
    const styleTag = this.host
      .querySelector('template')
      ?.content.querySelector('style');
    if (!styleTag) {
      return this.snippetStyle;
    }
    return styleTag.innerHTML;
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }
    const modalRef = document.createElement(
      'atomic-insight-smart-snippet-feedback-modal'
    );
    modalRef.addEventListener('feedbackSent', () => {
      this.setFeedbackSent(true);
    });
    this.setModalRef(modalRef);
    this.host.insertAdjacentElement('beforebegin', modalRef);
  }
}

import {SmartSnippetState, SmartSnippet} from '@coveo/headless';
import {h} from '@stencil/core';
import {Heading} from '../../heading';
import {Hidden} from '../../hidden';
import {AnyBindings} from '../../interface/bindings';
import {SmartSnippetFeedbackBanner} from '../atomic-smart-snippet-feedback-banner';

interface SmartSnippetProps {
  id: string;
  getHost: () => HTMLElement;
  getBindings: () => AnyBindings;
  getModalRef: () => HTMLAtomicSmartSnippetFeedbackModalElement | undefined;
  getHeadingLevel: () => number;
  getCollapsedHeight: () => number;
  getMaximumHeight: () => number;
  getSmartSnippetState: () => SmartSnippetState;
  getSmartSnippet: () => SmartSnippet;
  getSnippetStyle: () => string | undefined;
  getFeedbackSent: () => boolean;
  setModalRef: (ref: HTMLAtomicSmartSnippetFeedbackModalElement) => void;
  setFeedbackSent: (isSent: boolean) => void;
}

export class SmartSnippetCommon {
  constructor(private props: SmartSnippetProps) {}

  private get style() {
    const styleTag = this.props
      .getHost()
      .querySelector('template')
      ?.content.querySelector('style');
    if (!styleTag) {
      return this.props.getSnippetStyle();
    }
    return styleTag.innerHTML;
  }

  private loadModal() {
    if (this.props.getModalRef()) {
      return;
    }
    const modalRef = document.createElement(
      'atomic-smart-snippet-feedback-modal'
    );
    modalRef.addEventListener('feedbackSent', () => {
      this.props.setFeedbackSent(true);
    });
    this.props.setModalRef(modalRef);
    this.props.getHost().insertAdjacentElement('beforebegin', modalRef);
  }

  private renderQuestion() {
    const headingLevel = this.props.getHeadingLevel();
    return (
      <Heading
        level={headingLevel ? headingLevel + 1 : 0}
        class="text-xl font-bold"
        part="question"
      >
        {this.props.getSmartSnippetState().question}
      </Heading>
    );
  }

  private renderContent() {
    const state = this.props.getSmartSnippetState();
    return (
      <atomic-smart-snippet-expandable-answer
        exportparts="answer,show-more-button,show-less-button,truncated-answer"
        part="body"
        htmlContent={state.answer}
        expanded={state.expanded}
        maximumHeight={this.props.getMaximumHeight()}
        collapsedHeight={this.props.getCollapsedHeight()}
        snippetStyle={this.style}
        onExpand={() => this.props.getSmartSnippet().expand()}
        onCollapse={() => this.props.getSmartSnippet().collapse()}
        onSelectInlineLink={(e) =>
          this.props.getSmartSnippet().selectInlineLink(e.detail)
        }
        onBeginDelayedSelectInlineLink={(e) =>
          this.props.getSmartSnippet().beginDelayedSelectInlineLink(e.detail)
        }
        onCancelPendingSelectInlineLink={(e) =>
          this.props.getSmartSnippet().cancelPendingSelectInlineLink(e.detail)
        }
      ></atomic-smart-snippet-expandable-answer>
    );
  }

  private renderFeedbackBanner() {
    const state = this.props.getSmartSnippetState();
    return (
      <SmartSnippetFeedbackBanner
        i18n={this.props.getBindings().i18n}
        id={this.props.id}
        liked={state.liked}
        disliked={state.disliked}
        feedbackSent={this.props.getFeedbackSent()}
        onLike={() => this.props.getSmartSnippet().like()}
        onDislike={() => {
          this.loadModal();
          this.props.getSmartSnippet().dislike();
        }}
        onPressExplainWhy={() => (this.props.getModalRef()!.isOpen = true)}
        explainWhyRef={(button) => {
          if (this.props.getModalRef()) {
            this.props.getModalRef()!.source = button;
          }
        }}
      ></SmartSnippetFeedbackBanner>
    );
  }

  public hideDuringRender(shouldHide: boolean) {
    const host = this.props.getHost();
    host.style.visibility = shouldHide ? 'hidden' : '';
    host.style.position = shouldHide ? 'absolute' : '';
  }

  public render() {
    if (!this.props.getSmartSnippetState().answerFound) {
      return <Hidden></Hidden>;
    }

    if (this.props.getHost().classList.contains('atomic-hidden')) {
      this.hideDuringRender(true);
    }

    const source = this.props.getSmartSnippetState().source;

    return (
      <aside>
        <Heading
          level={this.props.getHeadingLevel() ?? 0}
          class="accessibility-only"
        >
          {this.props.getBindings().i18n.t('smart-snippet')}
        </Heading>
        <article
          class="bg-background border border-neutral rounded-lg p-6 pb-4 text-on-background"
          part="smart-snippet"
        >
          {this.renderQuestion()}
          {this.renderContent()}
          <footer
            part="footer"
            aria-label={this.props.getBindings().i18n.t('smart-snippet-source')}
          >
            {source && (
              <atomic-smart-snippet-source
                source={source}
                onSelectSource={this.props.getSmartSnippet().selectSource}
                onBeginDelayedSelectSource={
                  this.props.getSmartSnippet().beginDelayedSelectSource
                }
                onCancelPendingSelectSource={
                  this.props.getSmartSnippet().cancelPendingSelectSource
                }
              ></atomic-smart-snippet-source>
            )}
            {this.renderFeedbackBanner()}
          </footer>
        </article>
      </aside>
    );
  }
}

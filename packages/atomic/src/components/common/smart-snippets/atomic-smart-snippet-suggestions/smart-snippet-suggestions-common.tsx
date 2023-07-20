import {
  SmartSnippetRelatedQuestion,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
} from '@coveo/headless';
import {h} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import ArrowRight from '../../../../images/arrow-right.svg';
import {Button} from '../../button';
import {Heading} from '../../heading';
import {Hidden} from '../../hidden';
import {AnyBindings} from '../../interface/bindings';

interface SmartSnippetSuggestionProps {
  id: string;
  attributes?: Attr[];
  getHost: () => HTMLElement;
  getBindings: () => AnyBindings;
  getHeadingLevel: () => number;
  getState: () => SmartSnippetQuestionsListState;
  getQuestionsList: () => SmartSnippetQuestionsList;
  getSnippetStyle: () => string | undefined;
}

export class SmartSnippetSuggestionCommon {
  constructor(private props: SmartSnippetSuggestionProps) {}

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

  private getRelatedQuestionId(index: number) {
    return `${this.props.id}-${index}`;
  }

  private getQuestionPart(
    prefix: string,
    relatedQuestion: SmartSnippetRelatedQuestion
  ) {
    return prefix + (relatedQuestion.expanded ? '-expanded' : '-collapsed');
  }

  private toggleQuestion(relatedQuestion: SmartSnippetRelatedQuestion) {
    if (relatedQuestion.expanded) {
      this.props.getQuestionsList().collapse(relatedQuestion.questionAnswerId);
    } else {
      this.props.getQuestionsList().expand(relatedQuestion.questionAnswerId);
    }
  }

  private renderQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    const headingLevel = this.props.getHeadingLevel();
    return (
      <Button
        style="text-neutral"
        part={this.getQuestionPart('question-button', relatedQuestion)}
        onClick={() => this.toggleQuestion(relatedQuestion)}
        class="flex items-center px-4"
        ariaExpanded={`${relatedQuestion.expanded}`}
        ariaControls={this.getRelatedQuestionId(index)}
      >
        <atomic-icon
          icon={relatedQuestion.expanded ? ArrowDown : ArrowRight}
          part={this.getQuestionPart('question-icon', relatedQuestion)}
          class="w-2.5 mr-3 stroke-[1.25]"
        ></atomic-icon>
        <Heading
          level={headingLevel ? headingLevel + 1 : headingLevel}
          class="text-left text-xl font-bold py-4"
          part={this.getQuestionPart('question-text', relatedQuestion)}
        >
          {relatedQuestion.question}
        </Heading>
      </Button>
    );
  }

  private renderContent(relatedQuestion: SmartSnippetRelatedQuestion) {
    return (
      <atomic-smart-snippet-answer
        exportparts="answer"
        htmlContent={relatedQuestion.answer}
        innerStyle={this.style}
        onSelectInlineLink={(e) =>
          this.props
            .getQuestionsList()
            .selectInlineLink(relatedQuestion.questionAnswerId, e.detail)
        }
        onBeginDelayedSelectInlineLink={(e) =>
          this.props
            .getQuestionsList()
            .beginDelayedSelectInlineLink(
              relatedQuestion.questionAnswerId,
              e.detail
            )
        }
        onCancelPendingSelectInlineLink={(e) =>
          this.props
            .getQuestionsList()
            .cancelPendingSelectInlineLink(
              relatedQuestion.questionAnswerId,
              e.detail
            )
        }
      ></atomic-smart-snippet-answer>
    );
  }

  private renderSource(relatedQuestion: SmartSnippetRelatedQuestion) {
    const {source} = relatedQuestion;
    if (!source) {
      return [];
    }
    return (
      <footer
        part="footer"
        aria-label={this.props.getBindings().i18n.t('smart-snippet-source')}
      >
        {
          <atomic-smart-snippet-source
            source={source}
            receivedAttributes={this.props.attributes}
            onSelectSource={() =>
              this.props
                .getQuestionsList()
                .selectSource(relatedQuestion.questionAnswerId)
            }
            onBeginDelayedSelectSource={() =>
              this.props
                .getQuestionsList()
                .beginDelayedSelectSource(relatedQuestion.questionAnswerId)
            }
            onCancelPendingSelectSource={() =>
              this.props
                .getQuestionsList()
                .cancelPendingSelectSource(relatedQuestion.questionAnswerId)
            }
          ></atomic-smart-snippet-source>
        }
      </footer>
    );
  }

  public hideDuringRender(shouldHide: boolean) {
    const host = this.props.getHost();
    host.style.visibility = shouldHide ? 'hidden' : '';
    host.style.position = shouldHide ? 'absolute' : '';
  }

  public renderRelatedQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return (
      <li
        key={relatedQuestion.questionAnswerId}
        part={this.getQuestionPart('question-answer', relatedQuestion)}
        class="flex flex-col"
      >
        <article class="contents">
          {this.renderQuestion(relatedQuestion, index)}
          {relatedQuestion.expanded && (
            <div
              part="answer-and-source"
              class="pl-10 pr-6 pb-6"
              id={this.getRelatedQuestionId(index)}
            >
              {this.renderContent(relatedQuestion)}
              {this.renderSource(relatedQuestion)}
            </div>
          )}
        </article>
      </li>
    );
  }

  public render() {
    if (!this.props.getState().questions.length) {
      return <Hidden></Hidden>;
    }

    return (
      <aside
        part="container"
        class="bg-background border border-neutral rounded-lg text-on-background overflow-hidden"
      >
        <Heading
          level={this.props.getHeadingLevel()}
          part="heading"
          class="px-6 py-4 text-2xl leading-8 border-b border-neutral"
        >
          {this.props.getBindings().i18n.t('smart-snippet-people-also-ask')}
        </Heading>
        <ul part="questions" class="divide-neutral divide-y">
          {this.props
            .getState()
            .questions.map((relatedQuestion, i) =>
              this.renderRelatedQuestion(relatedQuestion, i)
            )}
        </ul>
      </aside>
    );
  }
}

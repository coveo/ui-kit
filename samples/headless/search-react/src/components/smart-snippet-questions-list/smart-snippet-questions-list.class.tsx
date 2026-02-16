import {
  buildSmartSnippetQuestionsList,
  type SmartSnippetQuestionsList as HeadlessSmartSnippetQuestionsList,
  type SmartSnippetQuestionsListState,
  type Unsubscribe,
} from '@coveo/headless';
import {Component, type ContextType} from 'react';
import {AppContext} from '../../context/engine';

export class SmartSnippetQuestionsList extends Component<
  {},
  SmartSnippetQuestionsListState
> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessSmartSnippetQuestionsList;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildSmartSnippetQuestionsList(this.context.engine!);
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }

    const {questions} = this.state;

    if (questions.length === 0) {
      return <div>Sorry, no related questions found</div>;
    }

    return (
      <div style={{textAlign: 'left'}}>
        People also ask:
        <dl>
          {questions.map((question) => {
            return (
              <>
                <dt>{question.question}</dt>
                <dd>
                  <div
                    style={{display: question.expanded ? 'block' : 'none'}}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
                    dangerouslySetInnerHTML={{__html: question.answer}}
                  ></div>
                  <button
                    style={{display: question.expanded ? 'none' : 'block'}}
                    onClick={() =>
                      this.controller.expand(question.questionAnswerId)
                    }
                  >
                    Show answer
                  </button>
                  <button
                    style={{display: question.expanded ? 'block' : 'none'}}
                    onClick={() =>
                      this.controller.collapse(question.questionAnswerId)
                    }
                  >
                    Hide answer
                  </button>
                </dd>
              </>
            );
          })}
        </dl>
      </div>
    );
  }
}

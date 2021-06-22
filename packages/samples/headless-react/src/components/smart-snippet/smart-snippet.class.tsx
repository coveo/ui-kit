import {Component, ContextType} from 'react';
import {
  buildSmartSnippet,
  SmartSnippet as HeadlessSmartSnippet,
  SmartSnippetState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class SmartSnippet extends Component<{}, SmartSnippetState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessSmartSnippet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildSmartSnippet(this.context.engine!);
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

    const {
      answerFound,
      answer,
      question,
      liked,
      disliked,
      expanded,
    } = this.state;

    console.log(answerFound, answer, question, liked, disliked, expanded);
    return (
      <div>
        {question}:{answer}
      </div>
    );
  }
}

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

  private answerStyles(expanded: boolean) {
    const maskImage = () =>
      expanded
        ? 'none'
        : 'linear-gradient(to bottom, black 50%, transparent 100%)';

    return {
      maxHeight: expanded ? '100%' : '100px',
      maxWidth: '200px',
      overflow: 'hidden',
      marginBottom: '10px',
      maskImage: maskImage(),
      WebkitMaskImage: maskImage(),
    };
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

    if (!answerFound) {
      return <div>Sorry, no answer has been found for this query.</div>;
    }

    return (
      <div style={{textAlign: 'left'}}>
        <dl>
          <dt>{question}</dt>
          <dd>
            <div
              dangerouslySetInnerHTML={{__html: answer}}
              style={this.answerStyles(expanded)}
            ></div>
            <button
              style={{display: expanded ? 'none' : 'block'}}
              onClick={() => this.controller.expand()}
            >
              Show complete answer
            </button>
            <button
              style={{display: expanded ? 'block' : 'none'}}
              onClick={() => this.controller.collapse()}
            >
              Collapse answer
            </button>
            <button
              style={{fontWeight: liked ? 'bold' : 'normal'}}
              onClick={() => this.controller.like()}
            >
              Thumbs up
            </button>
            <button
              style={{fontWeight: disliked ? 'bold' : 'normal'}}
              onClick={() => this.controller.dislike()}
            >
              Thumbs down
            </button>
          </dd>
        </dl>
      </div>
    );
  }
}

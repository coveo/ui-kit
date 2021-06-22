import {useEffect, useState, FunctionComponent} from 'react';
import {SmartSnippet as HeadlessSmartSnippet} from '@coveo/headless';

interface SmartSnippetProps {
  controller: HeadlessSmartSnippet;
}

export const SmartSnippet: FunctionComponent<SmartSnippetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const answerStyles = (expanded: boolean) => {
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
  };

  const {answerFound, answer, question, liked, disliked, expanded} = state;

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
            style={answerStyles(expanded)}
          ></div>
          <button
            style={{display: expanded ? 'none' : 'block'}}
            onClick={() => controller.expand()}
          >
            Show complete answer
          </button>
          <button
            style={{display: expanded ? 'block' : 'none'}}
            onClick={() => controller.collapse()}
          >
            Collapse answer
          </button>
          <button
            style={{fontWeight: liked ? 'bold' : 'normal'}}
            onClick={() => controller.like()}
          >
            Thumbs up
          </button>
          <button
            style={{fontWeight: disliked ? 'bold' : 'normal'}}
            onClick={() => controller.dislike()}
          >
            Thumbs down
          </button>
        </dd>
      </dl>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildSmartSnippet(engine);
 *
 * <SmartSnippet controller={controller} />;
 * ```
 */

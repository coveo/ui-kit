import type {SmartSnippet as HeadlessSmartSnippet} from '@coveo/headless';
import {type FunctionComponent, useEffect, useRef, useState} from 'react';
import {filterProtocol} from '../../utils/filter-protocol';

interface SmartSnippetProps {
  controller: HeadlessSmartSnippet;
}

export const SmartSnippet: FunctionComponent<SmartSnippetProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);
  const detailedAnswerRef = useRef<HTMLTextAreaElement>(null);

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

  const {
    answerFound,
    answer,
    question,
    liked,
    disliked,
    expanded,
    source,
    feedbackModalOpen,
  } = state;

  if (!answerFound) {
    return <div>Sorry, no answer has been found for this query.</div>;
  }

  function renderSource() {
    if (!source) {
      return;
    }
    return (
      <a
        href={filterProtocol(source.clickUri)}
        onClick={() => controller.selectSource()}
        onContextMenu={() => controller.selectSource()}
        onMouseDown={() => controller.selectSource()}
        onMouseUp={() => controller.selectSource()}
        onTouchStart={() => controller.beginDelayedSelectSource()}
        onTouchEnd={() => controller.cancelPendingSelectSource()}
      >
        Source
      </a>
    );
  }

  if (feedbackModalOpen) {
    return (
      <div role="dialog">
        <h1>What's wrong with this snippet?</h1>
        <fieldset>
          <legend>Give a simple answer</legend>
          <ul>
            <li>
              <button
                onClick={() => controller.sendFeedback('does_not_answer')}
              >
                It does not answer my question
              </button>
            </li>
            <li>
              <button
                onClick={() => controller.sendFeedback('partially_answers')}
              >
                It only partially answers my question
              </button>
            </li>
            <li>
              <button
                onClick={() => controller.sendFeedback('was_not_a_question')}
              >
                I was not asking a question
              </button>
            </li>
          </ul>
        </fieldset>
        OR
        <fieldset>
          <legend>Give a detailed answer</legend>
          <textarea ref={detailedAnswerRef}></textarea>
          <button
            onClick={() =>
              detailedAnswerRef.current &&
              controller.sendDetailedFeedback(detailedAnswerRef.current.value)
            }
          >
            Send feedback
          </button>
        </fieldset>
        <button onClick={() => controller.closeFeedbackModal()}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{textAlign: 'left'}}>
      <dl>
        <dt>{question}</dt>
        <dd>
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
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
          {renderSource()}
          {disliked ? (
            <button onClick={() => controller.openFeedbackModal()}>
              Explain why
            </button>
          ) : (
            []
          )}
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

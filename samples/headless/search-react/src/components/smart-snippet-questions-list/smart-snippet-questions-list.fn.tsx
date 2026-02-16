import type {SmartSnippetQuestionsList as HeadlessSmartSnippetQuestionsList} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface SmartSnippetQuestionsListProps {
  controller: HeadlessSmartSnippetQuestionsList;
}

export const SmartSnippetQuestionsList: FunctionComponent<
  SmartSnippetQuestionsListProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const {questions} = state;

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
                  onClick={() => controller.expand(question.questionAnswerId)}
                >
                  Show answer
                </button>
                <button
                  style={{display: question.expanded ? 'block' : 'none'}}
                  onClick={() => controller.collapse(question.questionAnswerId)}
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
};

// usage

/**
 * ```tsx
 * const controller = buildSmartSnippetQuestionsList(engine);
 *
 * <SmartSnippetQuestionsList controller={controller} />;
 * ```
 */

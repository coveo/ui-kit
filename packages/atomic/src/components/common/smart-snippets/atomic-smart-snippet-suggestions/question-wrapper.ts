import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface QuestionWrapperProps {
  /**
   * Whether the question is expanded.
   */
  expanded: boolean;
  /**
   * The key for the question.
   */
  key: string;
}

export const renderQuestionWrapper: FunctionalComponentWithChildren<
  QuestionWrapperProps
> =
  ({props}) =>
  (children) => {
    return html`<li
      key=${props.key}
      part=${`question-answer-${props.expanded ? 'expanded' : 'collapsed'}`}
      class="flex flex-col"
    >
      <article class="contents">${children}</article>
    </li>`;
  };

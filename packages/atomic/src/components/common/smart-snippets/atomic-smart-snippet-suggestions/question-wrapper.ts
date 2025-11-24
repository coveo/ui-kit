import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
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
    return html`${keyed(
      props.key,
      html`<li
        part=${`question-answer-${props.expanded ? 'expanded' : 'collapsed'}`}
        class="flex flex-col"
      >
        <article class="contents">${children}</article>
      </li>`
    )}`;
  };

import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface AnswerAndSourceWrapperProps {
  /**
   * The ID of the answer.
   */
  id: string;
}

export const renderAnswerAndSourceWrapper: FunctionalComponentWithChildren<
  AnswerAndSourceWrapperProps
> =
  ({props}) =>
  (children) => {
    return html`<div
      part="answer-and-source"
      class="pr-6 pb-6 pl-10"
      id=${props.id}
    >
      ${children}
    </div>`;
  };

import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface AnswerAndSourceWrapperProps {
  /**
   * Whether the answer is expanded.
   */
  expanded: boolean;
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
    const divClasses = tw({
      'pr-6 pb-6 pl-10': true,
    });

    return html`<div
      part="answer-and-source"
      class=${multiClassMap(divClasses)}
      id=${props.id}
    >
      ${children}
    </div>`;
  };

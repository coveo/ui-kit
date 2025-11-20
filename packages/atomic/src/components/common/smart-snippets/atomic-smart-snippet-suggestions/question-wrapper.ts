import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SmartSnippetSuggestionsQuestionWrapperProps {
  /**
   * Whether the question is expanded.
   */
  expanded: boolean;
  /**
   * The key for the question.
   */
  key: string;
}

export const renderSmartSnippetSuggestionsQuestionWrapper: FunctionalComponentWithChildren<SmartSnippetSuggestionsQuestionWrapperProps> =
  ({props}) =>
  (children) => {
    const liClasses = tw({
      'flex flex-col': true,
    });

    const articleClasses = tw({
      contents: true,
    });

    return html`<li
      key=${props.key}
      part=${`question-answer-${props.expanded ? 'expanded' : 'collapsed'}`}
      class=${multiClassMap(liClasses)}
    >
      <article class=${multiClassMap(articleClasses)}>${children}</article>
    </li>`;
  };

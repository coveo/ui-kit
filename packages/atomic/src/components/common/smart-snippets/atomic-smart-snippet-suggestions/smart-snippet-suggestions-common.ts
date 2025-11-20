import type {i18n} from 'i18next';
import {html} from 'lit';
import {type ButtonProps, renderButton} from '@/src/components/common/button';
import {
  type HeadingProps,
  renderHeading,
} from '@/src/components/common/heading';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SmartSnippetSuggestionsWrapperProps {
  /**
   * The heading level.
   */
  headingLevel: number;
  /**
   * The i18n instance for translations.
   */
  i18n: i18n;
}

export const renderSmartSnippetSuggestionsWrapper: FunctionalComponentWithChildren<
  SmartSnippetSuggestionsWrapperProps
> =
  ({props}) =>
  (children) => {
    const containerClasses = tw({
      'bg-background border-neutral text-on-background overflow-hidden rounded-lg border': true,
    });

    const headingClasses = tw({
      'border-neutral border-b px-6 py-4 text-xl leading-8': true,
    });

    const questionsClasses = tw({
      'divide-neutral divide-y': true,
    });

    return html`<aside
      part="container"
      class=${multiClassMap(containerClasses)}
      aria-label=${props.i18n.t('smart-snippet-people-also-ask')}
    >
      ${renderHeading({
        props: {
          level: props.headingLevel,
          class: multiClassMap(headingClasses),
          part: 'heading',
        },
      })(html`${props.i18n.t('smart-snippet-people-also-ask')}`)}
      <ul part="questions" class=${multiClassMap(questionsClasses)}>
        ${children}
      </ul>
    </aside>`;
  };

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

export const renderSmartSnippetSuggestionsQuestionWrapper: FunctionalComponentWithChildren<
  SmartSnippetSuggestionsQuestionWrapperProps
> =
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

export interface SmartSnippetSuggestionsQuestionProps {
  /**
   * The aria-controls attribute value.
   */
  ariaControls: string;
  /**
   * Whether the question is expanded.
   */
  expanded: boolean;
  /**
   * The heading level.
   */
  headingLevel?: number;
  /**
   * The click event handler.
   */
  onClick: (event: MouseEvent) => void;
  /**
   * The question text.
   */
  question: string;
}

export const renderSmartSnippetSuggestionsQuestion: FunctionalComponentWithChildren<
  SmartSnippetSuggestionsQuestionProps
> =
  ({props}) =>
  (children) => {
    const buttonProps: ButtonProps = {
      style: 'text-neutral',
      part: getQuestionPart('button', props.expanded),
      onClick: props.onClick,
      class: 'flex items-center px-4',
      ariaExpanded: props.expanded ? 'true' : undefined,
      ariaControls: props.expanded ? props.ariaControls : undefined,
    };

    const headingProps: HeadingProps = {
      level: props.headingLevel ? props.headingLevel + 1 : 0,
      class: 'py-4 text-left text-xl font-bold',
      part: getQuestionPart('text', props.expanded),
    };

    return renderButton({props: buttonProps})(
      html`${children}${renderHeading({props: headingProps})(
        html`${props.question}`
      )}`
    );
  };

export interface SmartSnippetSuggestionsAnswerAndSourceWrapperProps {
  /**
   * Whether the answer is expanded.
   */
  expanded: boolean;
  /**
   * The ID of the answer.
   */
  id: string;
}

export const renderSmartSnippetSuggestionsAnswerAndSourceWrapper: FunctionalComponentWithChildren<
  SmartSnippetSuggestionsAnswerAndSourceWrapperProps
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

export interface SmartSnippetSuggestionsFooterProps {
  /**
   * The i18n instance for translations.
   */
  i18n: i18n;
}

export const renderSmartSnippetSuggestionsFooter: FunctionalComponentWithChildren<
  SmartSnippetSuggestionsFooterProps
> =
  ({props}) =>
  (children) => {
    return html`<footer
      part="footer"
      aria-label=${props.i18n.t('smart-snippet-source')}
    >
      ${children}
    </footer>`;
  };

/**
 * Helper function to get the question part name based on the base and expanded state.
 */
export const getQuestionPart = (base: string, expanded: boolean): string =>
  `question-${base}-${expanded ? 'expanded' : 'collapsed'}`;

import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {renderHeading} from '../../heading';

export interface SmartSnippetWrapperProps {
  headingLevel?: number;
  i18n: i18n;
}

export const renderSmartSnippetWrapper: FunctionalComponentWithChildren<
  SmartSnippetWrapperProps
> =
  ({props}) =>
  (children) => {
    return html`<aside aria-label=${props.i18n.t('smart-snippet')}>
      ${renderHeading({
        props: {level: props.headingLevel ?? 0, class: 'sr-only'},
      })(html`${props.i18n.t('smart-snippet')}`)}
      <article
        class="bg-background border-neutral text-on-background rounded-lg border p-6 pb-4"
        part="smart-snippet"
      >
        ${children}
      </article>
    </aside>`;
  };

export interface SmartSnippetQuestionProps {
  headingLevel?: number;
  question: string;
}

export const renderSmartSnippetQuestion: FunctionalComponent<
  SmartSnippetQuestionProps
> = ({props}) => {
  return renderHeading({
    props: {
      level: props.headingLevel ? props.headingLevel + 1 : 0,
      class: 'text-xl font-bold',
      part: 'question',
    },
  })(html`${props.question}`);
};

export interface SmartSnippetTruncatedAnswerProps {
  answer: string;
  style?: string;
}

export const renderSmartSnippetTruncatedAnswer: FunctionalComponent<
  SmartSnippetTruncatedAnswerProps
> = ({props}) => {
  return html`<div part="truncated-answer">
    <atomic-smart-snippet-answer
      exportparts="answer"
      part="body"
      .htmlContent=${props.answer}
      .innerStyle=${ifDefined(props.style)}
    ></atomic-smart-snippet-answer>
  </div>`;
};

export interface SmartSnippetFooterProps {
  i18n: i18n;
}

export const renderSmartSnippetFooter: FunctionalComponentWithChildren<
  SmartSnippetFooterProps
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

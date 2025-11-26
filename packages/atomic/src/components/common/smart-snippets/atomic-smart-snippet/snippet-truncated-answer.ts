import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface SnippetTruncatedAnswerProps {
  answer: string;
  style?: string;
}

export const renderSnippetTruncatedAnswer: FunctionalComponent<
  SnippetTruncatedAnswerProps
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

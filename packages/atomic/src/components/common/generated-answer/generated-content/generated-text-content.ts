import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface GeneratedTextContentProps {
  answer?: string;
  isStreaming: boolean;
}

export const renderGeneratedTextContent: FunctionalComponent<
  GeneratedTextContentProps
> = ({props}) => {
  return html`
    <p
      part="generated-text"
      class="text-on-background mb-0 whitespace-pre-wrap ${
        props.isStreaming ? 'cursor' : ''
      }"
    >
      ${props.answer}
    </p>
  `;
};

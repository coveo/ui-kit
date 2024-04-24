import {FunctionalComponent, h} from '@stencil/core';
import DOMPurify from 'dompurify';
import {transformMarkdownToHtml} from './markdownUtils';

interface GeneratedMarkdownContentProps {
  answer?: string;
  isStreaming: boolean;
}

export const GeneratedMarkdownContent: FunctionalComponent<
  GeneratedMarkdownContentProps
> = (props) => {
  const answerAsHtml = DOMPurify.sanitize(
    transformMarkdownToHtml(props.answer ?? '')
  );

  return (
    <div
      part="generated-text"
      class={`mb-0 text-on-background whitespace-pre-wrap ${props.isStreaming ? 'cursor' : ''}`}
      innerHTML={answerAsHtml}
    />
  );
};

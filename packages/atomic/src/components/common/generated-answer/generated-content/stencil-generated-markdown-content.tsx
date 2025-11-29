import {FunctionalComponent, h} from '@stencil/core';
import DOMPurify from 'dompurify';
import {transformMarkdownToHtml} from './markdown-utils';

interface GeneratedMarkdownContentProps {
  answer?: string;
  isStreaming: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const GeneratedMarkdownContent: FunctionalComponent<
  GeneratedMarkdownContentProps
> = (props) => {
  const answerAsHtml = DOMPurify.sanitize(
    transformMarkdownToHtml(props.answer ?? ''),
    {ADD_ATTR: ['part']}
  );

  return (
    <div
      part="generated-text"
      class={`text-on-background mb-0 ${props.isStreaming ? 'cursor' : ''}`}
      innerHTML={answerAsHtml}
    />
  );
};

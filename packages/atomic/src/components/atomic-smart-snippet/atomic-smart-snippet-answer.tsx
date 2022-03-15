import {Component, h, Prop} from '@stencil/core';
import {sanitize} from 'dompurify';

/**
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-answer',
  styleUrl: 'atomic-smart-snippet-answer.pcss',
  shadow: true,
})
export class AtomicSmartSnippetAnswer {
  @Prop({reflect: true}) htmlContent!: string;

  public render() {
    return (
      // deepcode ignore ReactSetInnerHtml: Sanitized by back-end + dompurify
      <div
        innerHTML={sanitize(this.htmlContent, {
          USE_PROFILES: {html: true},
        })}
        part="answer"
      ></div>
    );
  }
}

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
  @Prop({reflect: true}) styleTag?: HTMLStyleElement;

  private get style() {
    if (!this.styleTag) {
      return null;
    }
    // deepcode ignore ReactSetInnerHtml: Parsed from an existing style element
    return <style innerHTML={this.styleTag.innerHTML}></style>;
  }

  public render() {
    return (
      <div>
        {this.style}
        {/* deepcode ignore ReactSetInnerHtml: Sanitized by back-end + dompurify */}
        <div
          innerHTML={sanitize(this.htmlContent, {
            USE_PROFILES: {html: true},
          })}
          part="answer"
        ></div>
      </div>
    );
  }
}

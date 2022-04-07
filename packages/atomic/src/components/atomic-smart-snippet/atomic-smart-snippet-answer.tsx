import {Component, h, Prop, Event, EventEmitter, Host} from '@stencil/core';
import {sanitize} from 'dompurify';
import {sanitizeStyle} from '../../utils/utils';

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
  @Prop({reflect: true}) innerStyle?: string;

  @Event({
    eventName: 'atomic/smartSnippet/answerRendered',
  })
  private answerRendered!: EventEmitter<{height: number}>;
  private wrapperElement?: HTMLElement;

  public componentDidRender() {
    this.answerRendered.emit({height: this.wrapperElement!.scrollHeight});
  }

  private get sanitizedStyle() {
    if (!this.innerStyle) {
      return undefined;
    }
    return sanitizeStyle(this.innerStyle);
  }

  private renderStyle() {
    const style = this.sanitizedStyle;
    if (!style) {
      return;
    }
    // deepcode ignore ReactSetInnerHtml: Defined by implementer and sanitized by dompurify
    return <style innerHTML={style}></style>;
  }

  private renderContent() {
    return (
      <div class="wrapper" ref={(element) => (this.wrapperElement = element)}>
        {/* deepcode ignore ReactSetInnerHtml: Sanitized by back-end + dompurify */}
        <div
          innerHTML={sanitize(this.htmlContent, {
            USE_PROFILES: {html: true},
          })}
          part="answer"
          class="margin"
        ></div>
      </div>
    );
  }

  public render() {
    return (
      <Host>
        {this.renderStyle()}
        {this.renderContent()}
      </Host>
    );
  }
}

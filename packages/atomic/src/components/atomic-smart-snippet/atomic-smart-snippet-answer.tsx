import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Host,
  Listen,
} from '@stencil/core';
import {sanitize} from 'dompurify';
import {sanitizeStyle} from '../../utils/utils';

/**
 * @part answer - The container displaying the full document excerpt.
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

  @Event({bubbles: false})
  private answerRendered!: EventEmitter<{height: number}>;
  private wrapperElement?: HTMLElement;
  private isRendering = true;

  public componentWillRender() {
    this.isRendering = true;
  }

  public componentDidRender() {
    this.isRendering = false;
    this.emitCurrentHeight();
  }

  @Listen('resize', {target: 'window'})
  public windowResized() {
    this.emitCurrentHeight();
  }

  private get sanitizedStyle() {
    if (!this.innerStyle) {
      return undefined;
    }
    return sanitizeStyle(this.innerStyle);
  }

  private emitCurrentHeight() {
    if (this.isRendering) {
      return;
    }
    this.answerRendered.emit({height: this.wrapperElement!.scrollHeight});
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

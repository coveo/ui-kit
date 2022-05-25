import {
  Component,
  h,
  Prop,
  Event,
  EventEmitter,
  Host,
  Element,
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
  @Prop() htmlContent!: string;
  @Prop() innerStyle?: string;

  @Element() public host!: HTMLElement;

  @Event({bubbles: false})
  private answerSizeUpdated!: EventEmitter<{height: number}>;
  private wrapperElement?: HTMLElement;
  private isRendering = true;
  private resizeObserver: ResizeObserver | undefined;

  public componentWillRender() {
    this.isRendering = true;
  }

  public componentDidRender() {
    this.isRendering = false;
    this.emitCurrentHeight();
  }

  public componentDidLoad() {
    // Prevents initial transition
    setTimeout(() => {
      this.host.classList.add('loaded');
    }, 0);
  }

  public connectedCallback() {
    if (this.wrapperElement && this.resizeObserver) {
      this.resizeObserver.observe(this.wrapperElement);
    }
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  public setWrapperElement(element: HTMLElement) {
    this.wrapperElement = element;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(() => this.emitCurrentHeight());
    this.resizeObserver.observe(element);
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
    this.answerSizeUpdated.emit({height: this.wrapperElement!.scrollHeight});
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
      <div
        class="wrapper"
        ref={(element) => element && this.setWrapperElement(element)}
      >
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

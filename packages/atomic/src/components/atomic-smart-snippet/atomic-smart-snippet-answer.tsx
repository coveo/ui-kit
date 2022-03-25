import {Component, h, Prop, Event, EventEmitter} from '@stencil/core';
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

  @Event({
    eventName: 'atomic/smartSnippet/answerRendered',
  })
  private answerRendered!: EventEmitter<{height: number}>;
  private wrapperElement?: HTMLElement;

  public componentDidRender() {
    this.answerRendered.emit({height: this.wrapperElement!.scrollHeight});
  }

  public render() {
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
}

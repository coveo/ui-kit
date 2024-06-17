import MARKED_JS from '@salesforce/resourceUrl/marked';
import {transformMarkdownToHtml} from 'c/quanticUtils';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedMarkdownContentTemplate from './templates/generatedMarkdownContent.html';
// @ts-ignore
import generatedTextContentTemplate from './templates/generatedTextContent.html';

/**
 * The `QuanticGeneratedAnswerContent` component displays the generated answer content.
 * @category Search
 * @example
 * <c-quantic-generated-answer-content answer-content-format={answerContentFormat} answer={answer} is-streaming={isStreaming}></c-quantic-generated-answer-content>
 */
export default class QuanticGeneratedAnswerContent extends LightningElement {
  /**
   * If the answer is streaming. It will render a blinking cursor at the end of the answer.
   * @api
   * @type {boolean}
   */
  @api isStreaming;
  /**
   * The format of the answer content. Can be either `text/plain` or `text/markdown`.
   * When `text/markdown` is selected, the answer content will be converted from markdown to HTML.
   * @api
   * @type {'text/plain' | 'text/markdown'}
   * @default {'text/plain'}
   */
  @api answerContentFormat = 'text/plain';
  /**
   * The answer content to display.
   * @api
   * @type {string}
   */
  @api
  get answer() {
    return this._answer;
  }
  set answer(value) {
    this._answer = value;
    if (this.answerContentFormat === 'text/markdown') {
      this.updateHtmlContent();
    }
  }

  _answer;

  connectedCallback() {
    if (this.answerContentFormat === 'text/markdown') {
      loadScript(this, MARKED_JS + '/marked.min.js')
        .then(() => {
          this.updateHtmlContent();
        })
        .catch((error) => {
          console.error('Error loading the Marked library.', error);
        });
    }
  }

  updateHtmlContent() {
    const newHTMLContent =
      // @ts-ignore
      (window.marked && transformMarkdownToHtml(this.answer, window.marked)) ||
      '';
    const answerContainer = this.template.querySelector(
      '.generated-answer-content__answer'
    );
    if (answerContainer) {
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      answerContainer.innerHTML = newHTMLContent;
    }
  }

  get generatedAnswerContentClass() {
    return `generated-answer-content__answer ${this.isStreaming ? 'generated-answer-content__answer--streaming' : ''}`;
  }

  get contentAsText() {
    return this._answer;
  }

  render() {
    return this.answerContentFormat === 'text/markdown'
      ? generatedMarkdownContentTemplate
      : generatedTextContentTemplate;
  }
}

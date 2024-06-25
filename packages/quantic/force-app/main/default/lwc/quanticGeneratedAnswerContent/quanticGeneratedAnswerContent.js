import {
  transformMarkdownToHtml,
  loadMarkdownDependencies,
} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedMarkdownContentTemplate from './templates/generatedMarkdownContent.html';
// @ts-ignore
import generatedTextContentTemplate from './templates/generatedTextContent.html';

/**
 * The `QuanticGeneratedAnswerContent` component displays the generated answer content.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-content answer-content-format={answerContentFormat} answer={answer} is-streaming={isStreaming}></c-quantic-generated-answer-content>
 */
export default class QuanticGeneratedAnswerContent extends LightningElement {
  /**
   * If the answer is streaming, it will render a blinking cursor at the end of the answer.
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
    if (
      this.answerContentFormat === 'text/markdown' &&
      this._markedLoaded &&
      this._domPurifyLoaded
    ) {
      this.updateHtmlContent();
    }
  }

  _answer;
  _markedLoaded = false;
  _domPurifyLoaded = false;

  connectedCallback() {
    if (this.answerContentFormat === 'text/markdown') {
      loadMarkdownDependencies(this)
        .then(() => {
          // @ts-ignore
          this._markedLoaded = true;
          // @ts-ignore
          this._domPurifyLoaded = true;
          this.updateHtmlContent();
        })
        .catch((error) => {
          console.error('Error loading the Marked library.', error);
          this._markedLoadingError = true;
        });
    }
  }

  updateHtmlContent() {
    const answerContainer = this.template.querySelector(
      '.generated-answer-content__answer'
    );
    if (this._markedLoaded && this._domPurifyLoaded) {
      // Transform the markdown answer to HTML and update the innerHTML of the container
      const newHTMLContent =
        // @ts-ignore
        (window.marked &&
          // @ts-ignore
          transformMarkdownToHtml(this.answer, window.marked)) ||
        '';
      if (answerContainer) {
        try {
          // @ts-ignore
          // eslint-disable-next-line @lwc/lwc/no-inner-html
          answerContainer.innerHTML = DOMPurify.sanitize(newHTMLContent);
        } catch (error) {
          // DOMPurify is not compatible with Locker Service, but Locker already sanitizes HTML.
          // eslint-disable-next-line @lwc/lwc/no-inner-html
          answerContainer.innerHTML = newHTMLContent;
        }
      }
    }
    // Fallback to display answer as text if the Marked library failed to load
    else {
      answerContainer.textContent = this.answer;
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

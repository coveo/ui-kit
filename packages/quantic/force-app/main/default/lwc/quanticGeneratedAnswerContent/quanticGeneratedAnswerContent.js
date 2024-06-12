import MARKED_JS from '@salesforce/resourceUrl/marked';
import {transformMarkdownToHtml} from 'c/quanticUtils';
// @ts-ignore
import {loadScript} from 'lightning/platformResourceLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedMarkdownContentTemplate from './templates/generatedMarkdownContent.html';
// @ts-ignore
import generatedTextContentTemplate from './templates/generatedTextContent.html';

export default class QuanticGeneratedAnswerContent extends LightningElement {
  @api isStreaming;
  @api answerContentFormat = 'text/plain';
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

  _ready = false;
  _answer;

  connectedCallback() {
    if (this.answerContentFormat === 'text/markdown') {
      loadScript(this, MARKED_JS + '/marked.min.js')
        .then(() => {
          this._ready = true;
          this.updateHtmlContent();
        })
        .catch((error) => {
          console.error('Error loading marked', error);
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

  get generatedAnswerClass() {
    return `generated-answer-content__answer ${this.isStreaming ? 'generated-answer-content__answer--streaming' : ''}`;
  }

  get content() {
    return this._answer;
  }

  render() {
    return this.answerContentFormat === 'text/markdown'
      ? generatedMarkdownContentTemplate
      : generatedTextContentTemplate;
  }
}

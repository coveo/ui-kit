import DOMPurify from 'dompurify';
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import styles from './generated-markdown-content.tw.css';
import {transformMarkdownToHtml} from './markdown-utils';

export class GeneratedMarkdownContent extends LitElement {
  static styles = styles;
  @property({type: String}) answer?: string;
  @property({type: Boolean}) isStreaming = false;

  render() {
    const answerAsHtml = DOMPurify.sanitize(
      transformMarkdownToHtml(this.answer ?? ''),
      {ADD_ATTR: ['part']}
    );

    return html`
      <div
        part="generated-text"
        class="text-on-background mb-0 ${this.isStreaming ? 'cursor' : ''}"
        .innerHTML=${answerAsHtml}
      ></div>
    `;
  }
}

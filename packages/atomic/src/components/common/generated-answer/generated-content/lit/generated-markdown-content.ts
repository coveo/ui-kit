import DOMPurify from 'dompurify';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {transformMarkdownToHtml} from '../markdown-utils';

@customElement('generated-markdown-content')
@withTailwindStyles
export class GeneratedMarkdownContent extends LitElement {
  @property({type: String}) answer?: string;
  @property({type: Boolean}) isStreaming = false;

  static styles = css`
    [part="generated-text"] [part="answer-heading-1"] {
      font-size: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    [part="generated-text"] [part="answer-heading-2"] {
      font-size: 1.25rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    [part="generated-text"] [part="answer-heading-3"],
    [part="generated-text"] [part="answer-heading-4"],
    [part="generated-text"] [part="answer-heading-5"],
    [part="generated-text"] [part="answer-heading-6"] {
      font-size: 1.125rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    [part="generated-text"] [part="answer-paragraph"] {
      margin-bottom: 1.5rem;
    }

    [part="generated-text"] [part="answer-list-item"],
    [part="generated-text"] [part="answer-paragraph"],
    [part="generated-text"] [part="answer-quote-block"],
    [part="generated-text"] [part="answer-table-header"],
    [part="generated-text"] [part="answer-table-content"] {
      line-height: 1.5rem;
    }

    [part="generated-text"] [part="answer-strong"] {
      font-weight: 700;
    }

    [part="generated-text"] [part="answer-ordered-list"] {
      margin-bottom: 0.5rem;
      list-style-type: decimal;
      padding-inline-start: 2rem;
    }

    [part="generated-text"] [part="answer-unordered-list"] {
      margin-bottom: 0.5rem;
      list-style-type: disc;
      padding-inline-start: 2rem;
    }

    [part="generated-text"] [part="answer-inline-code"] {
      font-size: 0.875rem;
      background: var(--neutral-light);
      border: 1px solid var(--neutral);
      border-radius: 0.125rem;
      padding: 0.125rem 0.25rem;
      color: var(--inline-code);
    }

    [part="generated-text"] [part="answer-code-block"] {
      background: var(--neutral-light);
      border: 1px solid var(--neutral);
      color: var(--on-background);
      margin: 1rem 0;
      max-height: 24rem;
      overflow: auto;
      border-radius: 0.375rem;
      padding: 0.5rem;
      font-size: 0.875rem;
      scrollbar-color: var(--atomic-neutral);
    }

    [part="generated-text"] [part="answer-quote-block"] {
      margin-left: 4rem;
      margin-right: 4rem;
      font-style: italic;
    }

    [part="generated-text"] [part="answer-table-container"] {
      border: 1px solid var(--neutral-dim);
      margin-bottom: 1.5rem;
      display: inline-block;
      max-height: 24rem;
      max-width: 100%;
      overflow: auto;
      border-radius: 0.375rem;
    }

    [part="generated-text"]
      [part="answer-table-container"]
      [part="answer-table-header"] {
      position: sticky;
      top: 0;
    }

    [part="generated-text"] [part="answer-table"] {
      font-size: 1rem;
    }

    [part="generated-text"]
      [part="answer-table"]
      thead
      [part="answer-table-header"] {
      background: var(--neutral);
      border-bottom: 1px solid var(--neutral-dim);
      border-left: 1px solid var(--neutral-dim);
      padding: 1rem;
      text-align: left;
      font-weight: 700;
    }

    [part="generated-text"]
      [part="answer-table"]
      thead
      [part="answer-table-header"]:first-of-type {
      border-left: none;
    }

    [part="generated-text"] [part="answer-table"] tbody tr:nth-child(even) {
      background: var(--neutral-light);
    }

    [part="generated-text"]
      [part="answer-table"]
      tbody
      tr
      [part="answer-table-content"] {
      border-left: 1px solid var(--neutral-dim);
      border-bottom: 1px solid var(--neutral-dim);
      border: 1px solid var(--neutral-dim);
      padding: 1rem;
    }

    [part="generated-text"]
      [part="answer-table"]
      tbody
      tr
      [part="answer-table-content"]:first-of-type {
      border-left: none;
    }

    [part="generated-text"]
      [part="answer-table"]
      tbody
      tr:last-of-type
      [part="answer-table-content"] {
      border-bottom: none;
    }
  `;

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

declare global {
  interface HTMLElementTagNameMap {
    'generated-markdown-content': GeneratedMarkdownContent;
  }
}

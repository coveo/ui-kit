import type {GeneratedAnswerCitation} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';

/**
 * The `atomic-citation-list` component displays a list of citations for a generated answer in the context of a multiturn conversation.
 *
 * @part citation-list - The container for the citation list
 * @part citation-item - Each individual citation item
 * @part citation-title - The title of the citation
 * @part citation-source - The source label of the citation
 * @part citation-link - The clickable link element
 */
@customElement('atomic-ai-citation-list')
@withTailwindStyles
export class AtomicAiCitationList extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
    }

    .citation-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 1rem;
    }

    .citation-list-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2e2e2e;
      margin: 0 0 1rem 0;
    }

    .citation-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .citation-item {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .citation-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .citation-link:hover .citation-title {
      text-decoration: underline;
    }

    .citation-source {
      font-size: 0.875rem;
      color: #828282;
      margin-bottom: 0.25rem;
    }

    .citation-title {
      font-size: 1rem;
      font-weight: 500;
      color: #2e2e2e;
    }
  `;

  /**
   * The array of citations to display
   */
  @property({type: Array, attribute: false})
  citations: GeneratedAnswerCitation[] = [];

  render() {
    // Guard against null/undefined citations
    const citationsToRender = this.citations || [];
    if (citationsToRender.length === 0) {
      return html``;
    }
    return html`
      <div part="citation-list" class="citation-list bg-gray-100">
        <h3 class="citation-list-title">Citations</h3>
        <ul class="citation-items">
          ${citationsToRender.map((citation) => this.renderCitation(citation))}
        </ul>
      </div>
    `;
  }

  private renderCitation(citation: GeneratedAnswerCitation) {
    const citationUrl = citation.clickUri || citation.uri;

    return html`
      <li part="citation-item" class="citation-item">
        <a
          part="citation-link"
          href="${citationUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="citation-link"
        >
          <div part="citation-source" class="citation-source">
            ${citation.source}
          </div>
          <div part="citation-title" class="citation-title">
            ${citation.title}
          </div>
        </a>
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ai-citation-list': AtomicAiCitationList;
  }
}

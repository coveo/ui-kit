import type {GeneratedAnswerCitation} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import '../atomic-citation-list/atomic-citation-list';

/**
 * The `atomic-citation-container` component displays a list of citations for a generated answer in the context of a multiturn conversation.
 *
 * @part citation-list - The container for the citation list
 * @part citation-item - Each individual citation item
 * @part citation-title - The title of the citation
 * @part citation-source - The source label of the citation
 * @part citation-link - The clickable link element
 */
@customElement('atomic-citation-container')
@withTailwindStyles
export class AtomicCitationContainer extends LitElement {
  /**
   * The array of citations to display
   */
  @property({type: Array, attribute: false})
  citations: GeneratedAnswerCitation[] = [];

  render() {
    // Guard against null/undefined citations

    return html`
      <div part="citation-list" class="citation-list">
        <h3 class="citation-list-title">Citations list:</h3>
        <atomic-citation-list .citations=${this.citations}></atomic-citation-list>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-citation-container': AtomicCitationContainer;
  }
}

import type {
  GeneratedAnswerCitation,
  InteractiveCitation,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit-html/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {getCitationWithTitle} from './generated-answer-utils';

export interface RenderCitationsProps {
  citations: GeneratedAnswerCitation[] | undefined;
  i18n: i18n;
  buildInteractiveCitation: (
    citation: GeneratedAnswerCitation
  ) => InteractiveCitation;
  logCitationHover: (citationId: string, citationHoverTimeMs: number) => void;
  disableCitationAnchoring?: boolean;
}

/**
 * Renders the list of citations for a generated answer.
 */
export const renderCitations: FunctionalComponent<RenderCitationsProps> = ({
  props,
}) => {
  const {
    citations,
    i18n,
    buildInteractiveCitation,
    logCitationHover,
    disableCitationAnchoring,
  } = props;

  return html`${when(citations && citations.length > 0, () =>
    citations?.map((citation: GeneratedAnswerCitation, index: number) => {
      const interactiveCitation = buildInteractiveCitation(citation);
      return keyed(
        citation.id,
        html`
        <li class="max-w-full">
          <atomic-citation
            .citation=${getCitationWithTitle(citation, i18n)}
            .index=${index}
            .sendHoverEndEvent=${(citationHoverTimeMs: number) => {
              logCitationHover(citation.id, citationHoverTimeMs);
            }}
            .interactiveCitation=${interactiveCitation}
            .disableCitationAnchoring=${disableCitationAnchoring}
            exportparts="citation,citation-popover"
          ></atomic-citation>
        </li>
      `
      );
    })
  )}`;
};

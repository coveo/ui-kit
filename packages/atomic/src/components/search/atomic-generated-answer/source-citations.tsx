import {GeneratedAnswerCitation} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';

interface SourceCitationsProps {
  label: string;
  citations: GeneratedAnswerCitation[];
  onCitationClick: (citation: GeneratedAnswerCitation) => void;
}

export const SourceCitations: FunctionalComponent<SourceCitationsProps> = (
  props
) =>
  props.citations.length ? (
    <div class="source-citations gap-2 mt-6 flex">
      <p class="citations-label mt-2 text-neutral-dark text-sm shrink-0">
        {props.label}
      </p>
      <div class="citations-container gap-2 flex items-center flex-wrap">
        {props.citations.map(
          (citation: GeneratedAnswerCitation, index: number) => (
            <a
              key={citation.id}
              title={citation.title}
              href={citation.clickUri ?? citation.uri}
              target="_blank"
              rel="noopener"
              onClick={() => props.onCitationClick(citation)}
              class="flex items-center citation p-1 bg-background btn-text-neutral text-neutral-dark text-sm border rounded-full border-neutral text-on-background"
            >
              <div class="rounded-full citation-index font-medium rounded-full flex items-center text-bg-blue shrink-0">
                <div class="mx-auto">{index + 1}</div>
              </div>
              <span class="citation-title truncate mx-1">{citation.title}</span>
            </a>
          )
        )}
      </div>
    </div>
  ) : null;

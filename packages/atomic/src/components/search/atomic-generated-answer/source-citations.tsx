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
    <div class="source-citations flex">
      <p class="citations-label text-neutral-dark text-sm shrink-0">
        {props.label}
      </p>
      <div class="citations-container flex items-center flex-wrap">
        {props.citations.map(
          (citation: GeneratedAnswerCitation, index: number) => (
            <a
              key={citation.id}
              href={citation.clickUri ?? citation.uri}
              target="_blank"
              onClick={() => props.onCitationClick(citation)}
              class="flex items-center citation bg-background btn-text-neutral text-neutral-dark text-sm border rounded-full border-neutral text-on-background"
            >
              <div class="citation-index rounded-full flex items-center text-bg-blue shrink-0">
                <div class="mx-auto">{index + 1}</div>
              </div>
              <span class="truncate mx-1">{citation.title}</span>
            </a>
          )
        )}
      </div>
    </div>
  ) : null;

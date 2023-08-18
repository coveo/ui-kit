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
      <p
        part="citations-label"
        class="py-1 text-neutral-dark shrink-0 flex flex-col justify-center"
      >
        {props.label}
      </p>
      <ol class="list-none citations-container gap-2 flex items-center flex-wrap">
        {props.citations.map(
          (citation: GeneratedAnswerCitation, index: number) => (
            <li key={citation.id}>
              <a
                title={citation.title}
                href={citation.clickUri ?? citation.uri}
                target="_blank"
                rel="noopener"
                onClick={() => props.onCitationClick(citation)}
                part="citation"
                class="flex items-center p-1 bg-background btn-text-neutral border rounded-full border-neutral text-on-background"
              >
                <div class="citation-index rounded-full font-medium rounded-full flex items-center text-bg-blue shrink-0">
                  <div class="mx-auto">{index + 1}</div>
                </div>
                <span class="citation-title truncate mx-1">
                  {citation.title}
                </span>
              </a>
            </li>
          )
        )}
      </ol>
    </div>
  ) : null;

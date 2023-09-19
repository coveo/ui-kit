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
              <atomic-source-citation
                index={index}
                citation={citation}
                href={citation.clickUri ?? citation.uri}
              ></atomic-source-citation>
            </li>
          )
        )}
      </ol>
    </div>
  ) : null;

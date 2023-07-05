import {GeneratedAnswerCitation} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {SourceCitations} from './source-citations';

interface GeneratedContentProps {
  answer?: string;
  citationsLabel: string;
  citations: GeneratedAnswerCitation[];
  onCitationClick: (citation: GeneratedAnswerCitation) => void;
}

export const GeneratedContent: FunctionalComponent<GeneratedContentProps> = (
  props
) => (
  <div class="mt-6">
    <p part="generated-text" class="mb-0 whitespace-pre-wrap leading-7">
      {props.answer}
    </p>
    <SourceCitations
      label={props.citationsLabel}
      citations={props.citations}
      onCitationClick={props.onCitationClick}
    />
  </div>
);

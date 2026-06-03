/* components/CitationsList.tsx */
import type {
  GeneratedAnswerCitation,
  GeneratedAnswerState,
  SearchEngine,
} from '@coveo/headless';
import {Citation} from './Citation.js';

type TCitationsList = {
  citations?: GeneratedAnswerState['citations']; //callout[These `GeneratedAnswerCitation` entities come from `GeneratedAnswerState`]
  isStreaming: GeneratedAnswerState['isStreaming']; //callout[`isStreaming` is part of `GeneratedAnswerState`]
  searchEngine: SearchEngine;
};

export const CitationsList = ({
  citations,
  isStreaming,
  searchEngine,
}: TCitationsList) => {
  if (!citations || isStreaming) return; //callout[Citations should only be rendered once the full generated answer has completed streaming.]

  return (
    <div>
      {citations.map((citation: GeneratedAnswerCitation) => (
        <Citation
          key={citation.id}
          citation={citation}
          searchEngine={searchEngine}
        />
      ))}
    </div>
  );
};

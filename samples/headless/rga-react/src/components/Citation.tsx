/* components/Citation.tsx */
import {
  buildInteractiveCitation,
  type GeneratedAnswerCitation,
  type InteractiveCitation,
  type SearchEngine,
} from '@coveo/headless';

type TCitation = {
  citation: GeneratedAnswerCitation;
  searchEngine: SearchEngine;
};

export const Citation = ({citation, searchEngine}: TCitation) => {
  const interactiveCitation: InteractiveCitation = buildInteractiveCitation(
    searchEngine,
    {
      options: {
        citation,
      },
    }
  ); // callout[Use `buildInteractiveCitation` to create a set of analytic actions that you can attach to an element containing a citation.]

  return (
    <button
      type="button"
      onClick={() => interactiveCitation.select()}
      onTouchEnd={() => interactiveCitation.cancelPendingSelect()}
      onTouchStart={() => interactiveCitation.beginDelayedSelect()}
    >
      {citation.title}
    </button>
  );
};

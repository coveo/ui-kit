import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';

export function filterOutDuplicatedCitations(
  citations: GeneratedAnswerCitation[]
): GeneratedAnswerCitation[] {
  const citationUris = new Set<string>();
  return citations.filter((citation: GeneratedAnswerCitation) => {
    const isCitationUriUnique = !citationUris.has(citation.uri);
    if (isCitationUriUnique) {
      citationUris.add(citation.uri);
    }
    return isCitationUriUnique;
  });
}

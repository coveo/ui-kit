import {SearchAppState} from '../../state/search-app-state';
import {GeneratedAnswerSection} from '../../state/state-sections';

export function citationSourceSelector(
  state: Partial<GeneratedAnswerSection>,
  citationId: string
) {
  return state.generatedAnswer?.citations?.find(
    (citation) => citation.id === citationId
  );
}

export function generativeQuestionAnsweringIdSelector(
  state: Partial<SearchAppState>
) {
  return state.search?.response?.extendedResults?.generativeQuestionAnsweringId;
}

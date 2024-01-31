import {GeneratedAnswerCitation} from '../api/generated-answer/generated-answer-event-payload';

/**
 * For internal use only.
 *
 * Returns a `GeneratedAnswerCitation` for testing purposes.
 * @param config  - A partial `GeneratedAnswerCitation` from which to build the target `GeneratedAnswerCitation`.
 * @returns The new `GeneratedAnswerCitation`.
 */
export function buildMockCitation(
  config: Partial<GeneratedAnswerCitation> = {}
): GeneratedAnswerCitation {
  return {
    id: '',
    title: '',
    uri: '',
    permanentid: '',
    clickUri: '',
    text: '',
    ...config,
  };
}

import type {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import {buildMockCitation} from '../../../test/mock-citation.js';
import {filterOutDuplicatedCitations} from './generated-answer-citation-utils.js';

const RICK_ROLL_CITATION: GeneratedAnswerCitation = buildMockCitation({
  uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
});

const JIRA_BUG_CITATION: GeneratedAnswerCitation = buildMockCitation({
  uri: 'https://coveord.atlassian.net/browse/SVCC-4945',
});

describe('filterOutDuplicatedCitations', () => {
  it('should return one citation when given a list containing the same citations multiple times', () => {
    const actualCitations = filterOutDuplicatedCitations([
      RICK_ROLL_CITATION,
      RICK_ROLL_CITATION,
      RICK_ROLL_CITATION,
    ]);

    expect(actualCitations).toHaveLength(1);
    expect(actualCitations).toEqual([RICK_ROLL_CITATION]);
  });

  it('should not modify the citation list when there is no duplication', () => {
    const expectedCitations = [RICK_ROLL_CITATION, JIRA_BUG_CITATION];

    const actualCitations = filterOutDuplicatedCitations(expectedCitations);

    expect(actualCitations).toHaveLength(2);
    expect(actualCitations).toEqual(expectedCitations);
  });

  it('should remove only duplicated citations', () => {
    const expectedCitations = [RICK_ROLL_CITATION, JIRA_BUG_CITATION];

    const actualCitations = filterOutDuplicatedCitations([
      ...expectedCitations,
      RICK_ROLL_CITATION,
    ]);

    expect(actualCitations).toHaveLength(2);
    expect(actualCitations).toEqual(expectedCitations);
  });

  it('should filter out citations based only on the uri', () => {
    const RICK_ROLL_CITATION_TWO: GeneratedAnswerCitation = buildMockCitation({
      uri: RICK_ROLL_CITATION.uri,
      id: 'differentId',
      permanentid: 'differentPermanentId',
      title: 'differentTitle',
      clickUri: 'differentClickUri',
      source: 'differentSource',
      text: 'differentText',
    });

    const actualCitations = filterOutDuplicatedCitations([
      RICK_ROLL_CITATION,
      RICK_ROLL_CITATION_TWO,
    ]);

    expect(actualCitations).toHaveLength(1);
    expect(actualCitations).toEqual([RICK_ROLL_CITATION]);
  });

  it('should process an empty list successfully', () => {
    const actualCitations = filterOutDuplicatedCitations([]);

    expect(actualCitations).toHaveLength(0);
  });
});

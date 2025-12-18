import {configuration} from '../../../app/common-reducers.js';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions.js';
import {
  logCaseDetach,
  logCitationDocumentAttach,
} from '../../../features/attached-results/attached-results-analytics-actions.js';
import {attachedResultsReducer} from '../../../features/attached-results/attached-results-slice.js';
import {buildMockCitation} from '../../../test/mock-citation.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import type {GeneratedAnswerCitation} from '../../generated-answer/headless-generated-answer.js';
import {
  type AttachedCitations,
  type AttachedCitationsOptions,
  buildAttachedCitations,
} from './headless-attached-citations.js';

vi.mock(
  '../../../features/attached-results/attached-results-analytics-actions',
  () => ({
    logCaseAttach: vi.fn(() => () => {}),
    logCaseDetach: vi.fn(() => () => {}),
    logCitationDocumentAttach: vi.fn(() => () => {}),
  })
);

vi.mock('../../../features/attached-results/attached-results-actions');

describe('attached citations', () => {
  let engine: MockedInsightEngine;
  let controller: AttachedCitations;
  const testCaseId = '12345';
  const testPermanentId = 'testPermanentId';
  const testUriHash = 'testUriHash';
  const testCitationId = 'testCitationId';

  const ensureStringOrUndefined = (value: unknown): string | undefined => {
    return typeof value === 'string' ? value : undefined;
  };

  const buildAttachedResultFromCitation = (
    citation: GeneratedAnswerCitation,
    caseId: string
  ) => {
    return {
      caseId,
      permanentId: citation.permanentid,
      resultUrl: citation.clickUri ?? citation.uri,
      title: citation.title,
      uriHash: ensureStringOrUndefined(citation.fields?.urihash),
      source:
        citation.source ?? ensureStringOrUndefined(citation.fields?.source),
      knowledgeArticleId: ensureStringOrUndefined(
        citation.fields?.knowledgeArticleId ?? citation.fields?.sfkbid
      ),
      articleLanguage: ensureStringOrUndefined(citation.fields?.sflanguage),
      articleVersionNumber: ensureStringOrUndefined(
        citation.fields?.sfversionnumber
      ),
      articlePublishStatus: ensureStringOrUndefined(
        citation.fields?.sfpublishstatus
      ),
      isCitation: true,
    };
  };

  const payload = buildMockCitation({
    permanentid: testPermanentId,
    id: testCitationId,
    fields: {
      urihash: testUriHash,
    },
  });

  const mockAttachedResult = {
    caseId: 'differentCaseId',
    permanentId: testPermanentId,
    resultUrl: 'http://example.com',
    title: 'Test Citation',
    uriHash: testUriHash,
    source: 'test-source',
    knowledgeArticleId: undefined,
    articleLanguage: undefined,
    articleVersionNumber: undefined,
    articlePublishStatus: undefined,
    isCitation: true,
  };

  const exampleOptions: AttachedCitationsOptions = {
    caseId: testCaseId,
  };

  function initAttachedResults(options = exampleOptions) {
    engine = buildMockInsightEngine(buildMockInsightState());
    controller = buildAttachedCitations(engine, {options});
  }

  beforeEach(() => {
    initAttachedResults();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes', () => {
    expect(controller).toBeTruthy();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      attachedResults: attachedResultsReducer,
    });
  });

  it('exposes a subscribe method', () => {
    expect(controller.subscribe).toBeTruthy();
  });

  describe('#isAttached', () => {
    describe('when no citation documents are attached', () => {
      it('calling #isAttached should return false', () => {
        expect(controller.isAttached(payload)).toBe(false);
      });
    });

    describe('when the citation document is attached', () => {
      it('#isAttached should return true', () => {
        const mockCitation = buildMockCitation({
          permanentid: testPermanentId,
          id: testCitationId,
          fields: {
            urihash: testUriHash,
          },
        });
        const matchingAttachedResult = {
          ...mockAttachedResult,
          caseId: testCaseId,
        };
        engine.state.attachedResults!.results.push(matchingAttachedResult);
        expect(controller.isAttached(mockCitation)).toBe(true);
      });

      it('#isAttached should return true even when multiple citations are attached', () => {
        [
          `${testPermanentId}1`,
          `${testPermanentId}2`,
          `${testPermanentId}3`,
        ].forEach((permId) => {
          const matchingAttachedResult = {
            ...mockAttachedResult,
            permanentId: permId,
            caseId: testCaseId,
          };
          engine.state.attachedResults!.results.push(matchingAttachedResult);
        });

        const testCitation = buildMockCitation({
          permanentid: `${testPermanentId}2`,
          id: testCitationId,
          fields: {
            urihash: testUriHash,
          },
        });
        expect(controller.isAttached(testCitation)).toBe(true);
      });

      it('#isAttached should return true when caseId and uriHash match but permanentId is undefined', () => {
        const mockCitation = buildMockCitation({
          permanentid: undefined,
          id: testCitationId,
          fields: {
            urihash: testUriHash,
          },
        });

        const attachedResult = {
          ...mockAttachedResult,
          permanentId: undefined,
          caseId: testCaseId,
        };

        engine.state.attachedResults!.results.push(attachedResult);
        expect(controller.isAttached(mockCitation)).toBe(true);
      });

      it('#isAttached should return false when caseId does not match', () => {
        const mockCitation = buildMockCitation({
          permanentid: testPermanentId,
          id: testCitationId,
          fields: {
            urihash: testUriHash,
          },
        });

        engine.state.attachedResults!.results.push(mockAttachedResult);
        expect(controller.isAttached(mockCitation)).toBe(false);
      });

      it('#isAttached should return false when permanentId and uriHash do not match', () => {
        const mockCitation = buildMockCitation({
          permanentid: 'nonMatchingPermanentId',
          id: testCitationId,
          fields: {
            urihash: 'nonMatchingUriHash',
          },
        });

        const attachedResult = {
          ...mockAttachedResult,
          caseId: testCaseId,
        };

        engine.state.attachedResults!.results.push(attachedResult);
        expect(controller.isAttached(mockCitation)).toBe(false);
      });
    });

    describe('when the citation document is not attached', () => {
      it('#isAttached should return false when caseId does not match but permanentId matches', () => {
        const attachedResultWithDifferentCaseId = {
          ...mockAttachedResult,
          caseId: 'differentCaseId',
        };
        engine.state.attachedResults!.results.push(
          attachedResultWithDifferentCaseId
        );

        expect(controller.isAttached(payload)).toBe(false);
      });

      it('#isAttached should return false when caseId does not match but uriHash matches', () => {
        const attachedResultWithDifferentCaseId = {
          ...mockAttachedResult,
          caseId: 'differentCaseId',
        };
        engine.state.attachedResults!.results.push(
          attachedResultWithDifferentCaseId
        );

        expect(controller.isAttached(payload)).toBe(false);
      });

      it('#isAttached should return false', () => {
        expect(controller.isAttached(payload)).toBe(false);
      });
    });
  });

  describe('#attach', () => {
    const testCitation = buildMockCitation({
      clickUri: 'foo.bar',
      title: 'test citation',
      permanentid: testPermanentId,
      id: testCitationId,
      fields: {
        urihash: testUriHash,
      },
    });

    it('calling #attach should trigger the #attachResult action with the correct payload', () => {
      controller.attach(testCitation);
      const attachedResult = buildAttachedResultFromCitation(
        testCitation,
        testCaseId
      );

      expect(attachResult).toHaveBeenCalledTimes(1);
      expect(attachResult).toHaveBeenCalledWith(attachedResult);
    });

    it('calling #attach should trigger the #logCitationDocumentAttach usage analytics action', () => {
      controller.attach(testCitation);

      expect(logCitationDocumentAttach).toHaveBeenCalledTimes(1);
      expect(logCitationDocumentAttach).toHaveBeenCalledWith(testCitation);
    });
  });

  describe('#detach', () => {
    const testCitation = buildMockCitation({
      clickUri: 'foo.bar',
      title: 'test citation',
      permanentid: testPermanentId,
      id: testCitationId,
      fields: {
        urihash: testUriHash,
      },
    });

    it('calling #detach should trigger the #detachResult action with the correct payload', () => {
      controller.detach(testCitation);
      const resultToDetach = buildAttachedResultFromCitation(
        testCitation,
        testCaseId
      );

      expect(detachResult).toHaveBeenCalledTimes(1);
      expect(detachResult).toHaveBeenCalledWith(resultToDetach);
    });

    it('calling #detach should trigger the #logCaseDetach usage analytics action', () => {
      controller.detach(testCitation);

      expect(logCaseDetach).toHaveBeenCalledTimes(1);
      expect(logCaseDetach).toHaveBeenCalledWith(testCitation);
    });
  });
});

import {createRelay} from '@coveo/relay';
import type {CaseAssistClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  type MockedCaseAssistEngine,
} from '../../test/mock-engine-v2.js';
import {getCaseFieldInitialState} from '../case-field/case-field-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getDocumentSuggestionInitialState} from '../document-suggestion/document-suggestion-state.js';
import {
  logAbandonCase,
  logAutoSelectCaseField,
  logCaseNextStage,
  logCaseStart,
  logClassificationClick,
  logCreateCase,
  logDocumentSuggestionClick,
  logDocumentSuggestionOpen,
  logDocumentSuggestionRating,
  logQuickviewDocumentSuggestionClick,
  logSolveCase,
  logUpdateCaseField,
} from './case-assist-analytics-actions.js';

const mockLogEnterInterface = vi.fn();
const mockLogMoveToNextCaseStep = vi.fn();
const mockLogCaseCreated = vi.fn();
const mockLogCaseSolved = vi.fn();
const mockLogCaseCancelled = vi.fn();
const mockLogUpdateCaseField = vi.fn();
const mockLogSelectFieldSuggestion = vi.fn();
const mockLogSelectDocumentSuggestion = vi.fn();
const mockLogRateDocumentSuggestion = vi.fn();
const mockLogQuickviewDocumentSuggestion = vi.fn();

const emit = vi.fn();

vi.mock('@coveo/relay');

vi.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  updateConfig: vi.fn(),
  version: 'foo',
});

vi.mock('coveo.analytics', () => {
  const mockCaseAssistClient = vi.fn().mockImplementation(function (
    this: CaseAssistClient
  ) {
    this.logEnterInterface = mockLogEnterInterface;
    this.logMoveToNextCaseStep = mockLogMoveToNextCaseStep;
    this.logCaseCreated = mockLogCaseCreated;
    this.logCaseSolved = mockLogCaseSolved;
    this.logCaseCancelled = mockLogCaseCancelled;
    this.logUpdateCaseField = mockLogUpdateCaseField;
    this.logSelectFieldSuggestion = mockLogSelectFieldSuggestion;
    this.logSelectDocumentSuggestion = mockLogSelectDocumentSuggestion;
    this.logRateDocumentSuggestion = mockLogRateDocumentSuggestion;
    this.logQuickviewDocumentSuggestion = mockLogQuickviewDocumentSuggestion;
  });
  return {
    CaseAssistClient: mockCaseAssistClient,
    history: {HistoryStore: vi.fn()},
  };
});

const exampleSubject = 'example subject';
const exampledDescription = 'example description';
const exampleCategory = 'example category';
const exampleProductId = 'abc';
const exampleId = '456';
const exampleFieldValue = 'bar';
const exampleClassificationValue = 'foo';
const exampleClassificationId = '123';
const exampleConfidence = 1;
const exampleClassificationResponseId = 'baz';
const exampleField = 'exampleField';
const exampleDocumentSuggestionResponseId = 'qux';
const exampleUniqueId = 'exampleUniqueId';
const exampleTitle = 'exampleTitle';
const exampleClickUri = 'exampleClickUri';
const exampleExcerpt = 'exampleExcerpt';
const exampleUri = 'exampleUri';
const exampleUrihash = 'exampleUrihash';

const exampleCaseInputState = {
  subject: {value: exampleSubject},
  description: {value: exampledDescription},
  category: {value: exampleCategory},
  productId: {value: exampleProductId},
  id: {value: exampleId},
};

const exampleCaseFieldState = {
  status: {
    ...getCaseFieldInitialState().status,
    lastResponseId: exampleClassificationResponseId,
  },
  fields: {
    [exampleField]: {
      value: exampleFieldValue,
      suggestions: [
        {
          value: exampleClassificationValue,
          id: exampleClassificationId,
          confidence: exampleConfidence,
        },
      ],
    },
  },
};

const exampleDocumentSuggestionState = {
  status: {
    ...getDocumentSuggestionInitialState().status,
    lastResponseId: exampleDocumentSuggestionResponseId,
  },
  documents: [
    {
      uniqueId: exampleUniqueId,
      title: exampleTitle,
      clickUri: exampleClickUri,
      hasHtmlVersion: true,
      excerpt: exampleExcerpt,
      fields: {
        uri: exampleUri,
        urihash: exampleUrihash,
      },
    },
  ],
};

describe('generated answer insight analytics actions', () => {
  let engine: MockedCaseAssistEngine;

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    const expectedTicketPayload = {
      subject: exampleSubject,
      description: exampledDescription,
      category: exampleCategory,
      productId: exampleProductId,
      id: exampleId,
      custom: {
        exampleField: 'bar',
      },
    };

    const expectedClassificationSuggestion = {
      classificationId: exampleClassificationId,
      responseId: exampleClassificationResponseId,
      fieldName: exampleField,
      classification: {
        value: exampleClassificationValue,
        confidence: exampleConfidence,
      },
    };

    const expectedDocumentSuggestion = {
      suggestionId: exampleUniqueId,
      responseId: exampleDocumentSuggestionResponseId,
      suggestion: {
        documentUri: exampleUri,
        documentUriHash: exampleUrihash,
        documentTitle: exampleTitle,
        documentUrl: exampleClickUri,
        documentPosition: 1,
      },
    };

    beforeEach(() => {
      engine = buildMockCaseAssistEngine(
        buildMockCaseAssistState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          caseInput: exampleCaseInputState,
          caseField: exampleCaseFieldState,
          documentSuggestion: exampleDocumentSuggestionState,
        })
      );
    });

    it('should log #logCaseStart with the right payload', async () => {
      await logCaseStart()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogEnterInterface;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({ticket: expectedTicketPayload});
    });

    it('should log #logCaseNextStage with the right payload', async () => {
      const exampleStageName = 'foo';
      await logCaseNextStage({stageName: exampleStageName})()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogMoveToNextCaseStep;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        stage: exampleStageName,
      });
    });

    it('should log #logCreateCase with the right payload', async () => {
      await logCreateCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogCaseCreated;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({ticket: expectedTicketPayload});
    });

    it('should log #logSolveCase with the right payload', async () => {
      await logSolveCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogCaseSolved;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({ticket: expectedTicketPayload});
    });

    it('should log #logAbandonCase with the right payload', async () => {
      await logAbandonCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogCaseCancelled;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({ticket: expectedTicketPayload});
    });

    it('should log #logUpdateCaseField with the right payload', async () => {
      await logUpdateCaseField(exampleField)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogUpdateCaseField;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        fieldName: exampleField,
      });
    });

    it('should log #logAutoSelectCaseField with the right payload', async () => {
      await logAutoSelectCaseField(exampleClassificationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogSelectFieldSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: {
          ...expectedClassificationSuggestion,
          autoSelection: true,
        },
      });
    });

    it('should log #logClassificationClick with the right payload', async () => {
      await logClassificationClick(exampleClassificationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogSelectFieldSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: expectedClassificationSuggestion,
      });
    });

    it('should log #logDocumentSuggestionClick with the right payload', async () => {
      await logDocumentSuggestionClick(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogSelectDocumentSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: expectedDocumentSuggestion,
      });
    });

    it('should log #logQuickviewDocumentSuggestionClick with the right payload', async () => {
      await logQuickviewDocumentSuggestionClick(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogQuickviewDocumentSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: expectedDocumentSuggestion,
      });
    });

    it('should log #logDocumentSuggestionOpen with the right payload', async () => {
      await logDocumentSuggestionOpen(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogSelectDocumentSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: {...expectedDocumentSuggestion, openDocument: true},
      });
    });

    it('should log #logDocumentSuggestionRating with the right payload', async () => {
      const exampleRatingValue = 1;
      await logDocumentSuggestionRating(exampleUniqueId, exampleRatingValue)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogRateDocumentSuggestion;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        ticket: expectedTicketPayload,
        suggestion: expectedDocumentSuggestion,
        rating: exampleRatingValue,
      });
    });
  });

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildMockCaseAssistEngine(
        buildMockCaseAssistState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          caseInput: exampleCaseInputState,
          caseField: exampleCaseFieldState,
          documentSuggestion: exampleDocumentSuggestionState,
        })
      );
    });

    it('should log #logCaseStart with the right payload', async () => {
      await logCaseStart()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logCreateCase with the right payload', async () => {
      await logCreateCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logSolveCase with the right payload', async () => {
      await logSolveCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logAbandonCase with the right payload', async () => {
      await logAbandonCase()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logUpdateCaseField with the right payload', async () => {
      await logUpdateCaseField(exampleField)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logAutoSelectCaseField with the right payload', async () => {
      await logAutoSelectCaseField(exampleClassificationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logClassificationClick with the right payload', async () => {
      await logClassificationClick(exampleClassificationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logDocumentSuggestionClick with the right payload', async () => {
      await logDocumentSuggestionClick(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logQuickviewDocumentSuggestionClick with the right payload', async () => {
      await logQuickviewDocumentSuggestionClick(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logDocumentSuggestionOpen with the right payload', async () => {
      await logDocumentSuggestionOpen(exampleUniqueId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logDocumentSuggestionRating with the right payload', async () => {
      await logDocumentSuggestionRating(exampleUniqueId, 1)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});

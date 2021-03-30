jest.mock('coveo.analytics');
import {handleOneAnalyticsEvent} from 'coveo.analytics';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {buildMockCaseAssistAppEngine, MockEngine} from '../../test/mock-engine';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  initializeTicketLogging,
  logTicketCancelled,
  logTicketClassificationClick,
  logTicketCreated,
  logTicketCreateStart,
  logTicketDocumentSuggestionClick,
  logTicketDocumentSuggestionRating,
  logTicketFieldUpdated,
  logTicketNextStage,
  logTicketSolved,
} from './case-assist-analytics-actions';
import {getCaseAssistInitialState} from './case-assist-state';

describe('case assist analytics actions', () => {
  const predictionId = 'some prediction id';
  const fieldClassification = {
    name: 'some field',
    predictions: [
      {
        id: predictionId,
        value: 'some prediction value',
        confidence: 0.987,
      },
    ],
  };
  const classifyResponseId = 'classify response id';

  const suggestionId = 'some suggestion id';
  const documentSuggestion = {
    clickUri: 'https://some.document.uri/click',
    excerpt: 'the document excerpt',
    fields: {
      uri: 'https://some.document.uri',
      urihash: 'some hash',
    },
    hasHtmlVersion: false,
    title: 'some title',
    uniqueId: suggestionId,
  };
  const suggestDocumentsResponseId = 'documents suggest response id';

  const initialTicketData = {};

  let state: CaseAssistAppState;
  let engine: MockEngine<CaseAssistAppState>;
  let uaMock: jest.Mock;

  beforeEach(() => {
    state = buildMockState();
    engine = buildMockCaseAssistAppEngine({state});
    uaMock = handleOneAnalyticsEvent as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const buildMockState = () => {
    const initial = {
      configuration: getConfigurationInitialState(),
      caseAssist: getCaseAssistInitialState(),
    };

    initial.configuration.accessToken = 'some token';
    initial.configuration.analytics.apiBaseUrl =
      'https://some.analytics.endpoint';

    return initial;
  };

  const getInitArgs = () => [
    'init',
    state.configuration.accessToken,
    state.configuration.analytics.apiBaseUrl,
  ];
  const getSetActionArgs = (actionName: string, data?: unknown) => {
    const baseArgs = ['svc:setAction', actionName];
    return data ? [...baseArgs, data] : baseArgs;
  };
  const getSetTicketArgs = (data: unknown = initialTicketData) => [
    'svc:setTicket',
    data,
  ];

  const getSendEventArgs = (eventName: string) => [
    'send',
    'event',
    'svc',
    eventName,
  ];

  const toUaDocumentSuggestionArg = (doc: any, position: number) => ({
    documentUri: doc.clickUri,
    documentUriHash: doc.fields.urihash,
    documentTitle: doc.title,
    documentUrl: doc.fields.uri,
    documentPosition: position,
  });

  describe('initializeTicketLogging', () => {
    it('should initialize analytics logger', () => {
      engine.dispatch(initializeTicketLogging());

      expect(uaMock.mock.calls).toEqual([getInitArgs()]);
    });
  });

  describe('logTicketCreateStart', () => {
    it('should set action, and send event', () => {
      engine.dispatch(logTicketCreateStart());

      expect(uaMock.mock.calls).toEqual([
        getSetActionArgs('ticket_create_start'),
        getSendEventArgs('flowStart'),
      ]);
    });
  });

  describe('logTicketFieldUpdated', () => {
    it('should update ticket info, set action, and send event', () => {
      engine.dispatch(logTicketFieldUpdated({fieldName: 'some field'}));

      expect(uaMock.mock.calls).toEqual([
        getSetTicketArgs(),
        getSetActionArgs('ticket_field_update', {fieldName: 'some field'}),
        getSendEventArgs('click'),
      ]);
    });
  });

  describe('logTicketClassificationClick', () => {
    it('should update ticket info, set action, and send event', () => {
      state.caseAssist.classifications = {
        ...state.caseAssist.classifications,
        fields: [fieldClassification],
        responseId: classifyResponseId,
      };
      engine = buildMockCaseAssistAppEngine({state});

      engine.dispatch(logTicketClassificationClick({predictionId}));

      expect(uaMock.mock.calls).toEqual([
        getSetTicketArgs(),
        getSetActionArgs('ticket_classification_click', {
          classificationId: predictionId,
          responseId: classifyResponseId,
          fieldName: fieldClassification.name,
          classification: {
            value: fieldClassification.predictions[0].value,
            confidence: fieldClassification.predictions[0].confidence,
          },
        }),
        getSendEventArgs('click'),
      ]);
    });

    it('should not send event if classification is not found', () => {
      engine.dispatch(logTicketClassificationClick({predictionId}));

      expect(uaMock.mock.calls.length).toBe(0);
    });
  });

  describe('logTicketNextStage', () => {
    it('should update ticket info, set action, and send event', () => {
      engine.dispatch(logTicketNextStage());

      expect(uaMock.mock.calls).toEqual([
        getSetTicketArgs(),
        getSetActionArgs('ticket_next_stage'),
        getSendEventArgs('click'),
      ]);
    });
  });

  describe('logTicketDocumentSuggestionClick', () => {
    it('should set action, and send event', () => {
      state.caseAssist.documentSuggestions = {
        ...state.caseAssist.documentSuggestions,
        documents: [documentSuggestion],
        responseId: suggestDocumentsResponseId,
      };
      engine = buildMockCaseAssistAppEngine({state});

      engine.dispatch(logTicketDocumentSuggestionClick({suggestionId}));

      expect(uaMock.mock.calls).toEqual([
        getSetActionArgs('suggestion_click', {
          suggestionId,
          responseId: suggestDocumentsResponseId,
          suggestion: toUaDocumentSuggestionArg(documentSuggestion, 1),
        }),
        getSendEventArgs('click'),
      ]);
    });

    it('should not send event if document suggestion is not found', () => {
      engine.dispatch(
        logTicketDocumentSuggestionClick({suggestionId: 'unknown id'})
      );

      expect(uaMock.mock.calls.length).toBe(0);
    });
  });

  describe('logTicketDocumentSuggestionRating', () => {
    it('should set action, and send event', () => {
      state.caseAssist.documentSuggestions = {
        ...state.caseAssist.documentSuggestions,
        documents: [documentSuggestion],
        responseId: suggestDocumentsResponseId,
      };
      engine = buildMockCaseAssistAppEngine({state});

      engine.dispatch(
        logTicketDocumentSuggestionRating({suggestionId, rating: 3.0})
      );

      expect(uaMock.mock.calls).toEqual([
        getSetActionArgs('suggestion_rate', {
          rate: 3.0,
          suggestionId,
          responseId: suggestDocumentsResponseId,
          suggestion: toUaDocumentSuggestionArg(documentSuggestion, 1),
        }),
        getSendEventArgs('click'),
      ]);
    });

    it('should not send event if document suggestion is not found', () => {
      engine.dispatch(
        logTicketDocumentSuggestionRating({suggestionId, rating: 3.0})
      );

      expect(uaMock.mock.calls.length).toBe(0);
    });
  });

  describe('logTicketSolved', () => {
    it('should set action, and send event', () => {
      engine.dispatch(logTicketSolved());

      expect(uaMock.mock.calls).toEqual([
        getSetActionArgs('ticket_cancel', {reason: 'Solved'}),
        getSendEventArgs('click'),
      ]);
    });
  });

  describe('logTicketCancelled', () => {
    it('should set action, and send event', () => {
      engine.dispatch(logTicketCancelled());

      expect(uaMock.mock.calls).toEqual([
        getSetActionArgs('ticket_cancel', {reason: 'Quit'}),
        getSendEventArgs('click'),
      ]);
    });
  });

  describe('logTicketCreated', () => {
    it('should update ticket info, set action, and send event', () => {
      const ticketId = 'some ticket id';

      engine.dispatch(logTicketCreated({ticketId}));

      expect(uaMock.mock.calls).toEqual([
        getSetTicketArgs({
          ...initialTicketData,
          id: ticketId,
        }),
        getSetActionArgs('ticket_create'),
        getSendEventArgs('click'),
      ]);
    });
  });
});

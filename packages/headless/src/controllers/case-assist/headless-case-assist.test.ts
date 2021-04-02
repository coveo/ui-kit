import {Action} from '@reduxjs/toolkit';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseInformationValue,
} from '../../features/case-assist/case-assist-actions';
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
} from '../../features/case-assist/case-assist-analytics-actions';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {buildMockCaseAssistAppEngine, MockEngine} from '../../test/mock-engine';
import {buildCaseAssist, CaseAssist} from './headless-case-assist';

describe('Case Assist', () => {
  let engine: MockEngine<CaseAssistAppState>;
  let caseAssist: CaseAssist;

  beforeEach(() => {
    engine = buildMockCaseAssistAppEngine();
    caseAssist = buildCaseAssist(engine);
  });

  const expectActionMatching = (action: Action, payload: any = null) => {
    const a = engine.actions.find((a) => a.type === action.type);
    expect(a).toBeTruthy();
    if (a && payload) {
      expect(a.payload).toEqual(payload);
    }
  };

  it('initializes', () => {
    expect(caseAssist).toBeTruthy();
  });

  it('setCaseInformationValue dispatches a setCaseInformationValue action', () => {
    caseAssist.setCaseInformationValue('subject', 'some case subject');

    expectActionMatching(setCaseInformationValue, {
      fieldName: 'subject',
      fieldValue: 'some case subject',
    });
  });

  it('getClassifications dispatches a getClassifications action', () => {
    caseAssist.getClassifications();

    expectActionMatching(getClassifications.pending);
  });

  it('getDocumentSuggestions dispatches a getDocumentSuggestions action', () => {
    caseAssist.getDocumentSuggestions();

    expectActionMatching(getDocumentSuggestions.pending);
  });

  it('initializeTicketLogging dispatches a initializeTicketLogging action', () => {
    caseAssist.initializeTicketLogging();

    expectActionMatching(initializeTicketLogging.pending);
  });

  it('logTicketCreateStart dispatches a logTicketCreateStart action', () => {
    caseAssist.logTicketCreateStart();

    expectActionMatching(logTicketCreateStart.pending);
  });

  it('logTicketFieldUpdated dispatches a logTicketFieldUpdated action', () => {
    caseAssist.logTicketFieldUpdated('some field');

    expectActionMatching(logTicketFieldUpdated.pending);
  });

  it('logTicketClassificationClick dispatches a logTicketClassificationClick action', () => {
    caseAssist.logTicketClassificationClick('some id');

    expectActionMatching(logTicketClassificationClick.pending);
  });

  it('logTicketNextStage dispatches a logTicketNextStage action', () => {
    caseAssist.logTicketNextStage();

    expectActionMatching(logTicketNextStage.pending);
  });

  it('logTicketDocumentSuggestionClick dispatches a logTicketDocumentSuggestionClick action', () => {
    caseAssist.logTicketDocumentSuggestionClick('some id');

    expectActionMatching(logTicketDocumentSuggestionClick.pending);
  });

  it('logTicketDocumentSuggestionRating dispatches a logTicketDocumentSuggestionRating action', () => {
    caseAssist.logTicketDocumentSuggestionRating('some id', 3.5);

    expectActionMatching(logTicketDocumentSuggestionRating.pending);
  });

  it('logTicketSolved dispatches a logTicketSolved action', () => {
    caseAssist.logTicketSolved();

    expectActionMatching(logTicketSolved.pending);
  });

  it('logTicketCancelled dispatches a logTicketCancelled action', () => {
    caseAssist.logTicketCancelled();

    expectActionMatching(logTicketCancelled.pending);
  });

  it('logTicketCreated dispatches a logTicketCreated action', () => {
    caseAssist.logTicketCreated('some id');

    expectActionMatching(logTicketCreated.pending);
  });
});

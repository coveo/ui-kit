import {Action} from '@reduxjs/toolkit';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseAssistId,
  setCaseInformationValue,
  setUserContextValue,
} from '../../features/case-assist/case-assist-actions';
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

  it('setCaseAssistId dispatches a setCaseAssistId action', () => {
    caseAssist.setCaseAssistId('some id');

    expectActionMatching(setCaseAssistId, {id: 'some id'});
  });

  it('setCaseInformationValue dispatches a setCaseInformationValue action', () => {
    caseAssist.setCaseInformationValue('subject', 'some case subject');

    expectActionMatching(setCaseInformationValue, {
      fieldName: 'subject',
      fieldValue: 'some case subject',
    });
  });

  it('setUserContextValue dispatches a setUserContextValue action', () => {
    caseAssist.setUserContextValue('occupation', 'marketer');

    expectActionMatching(setUserContextValue, {
      key: 'occupation',
      value: 'marketer',
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
});

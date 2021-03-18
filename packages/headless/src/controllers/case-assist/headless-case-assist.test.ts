import {getClassifications} from '../../features/case-assist/case-assist-actions';
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

  it('initializes', () => {
    expect(caseAssist).toBeTruthy();
  });

  it('#getClassifications dispatches a #getClassifications action', () => {
    caseAssist.getClassifications({
      fields: {
        subject: 'some subject',
      },
    });

    const action = engine.actions.find(
      (a) => (a.type = getClassifications.pending.type)
    );
    expect(action).toBeTruthy();
  });
});

import {getClassifications} from './case-assist-actions';
import {caseAssistReducer} from './case-assist-slice';
import {CaseAssistState, getCaseAssistInitialState} from './case-assist-state';

describe('case assist slice', () => {
  let state: CaseAssistState;

  beforeEach(() => {
    state = getCaseAssistInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = caseAssistReducer(undefined, {type: ''});

    expect(finalState).toEqual(getCaseAssistInitialState());
  });

  it('getClassifications.pending raises the loading flag', () => {
    const action = getClassifications.pending('some request id', {
      fields: {subject: 'something'},
    });
    const finalState = caseAssistReducer(state, action);

    expect(finalState.classifications.loading).toBe(true);
  });

  it('getClassifications.fulfilled updates classifications', () => {
    const classifications = {
      fields: [
        {
          name: 'product',
          predictions: [
            {
              id: '81d783b8-ac8e-50a2-8d25-cc5febd2a7b7',
              value: 'tv',
              confidence: 0.987,
            },
          ],
        },
      ],
      responseId: 'a43ef97e-85f0-4328-a1b4-b4bb791deb6e',
    };
    const action = getClassifications.fulfilled(
      {classifications},
      'some request id',
      {fields: {subject: 'something'}}
    );
    const finalState = caseAssistReducer(state, action);

    expect(finalState.classifications.loading).toBe(false);
    expect(finalState.classifications.fields).toEqual(classifications.fields);
    expect(finalState.classifications.responseId).toBe(
      classifications.responseId
    );
  });

  it('getClassifications.rejected stores the error', () => {
    const action = getClassifications.rejected(
      new Error('something bad happened'),
      'some request id',
      {fields: {subject: 'something'}}
    );
    const finalState = caseAssistReducer(state, action);

    expect(finalState.classifications.error).toEqual({
      message: 'something bad happened',
    });
    expect(finalState.classifications.loading).toBe(false);
    expect(finalState.classifications.fields).toEqual([]);
    expect(finalState.classifications.responseId).toBe('');
  });
});

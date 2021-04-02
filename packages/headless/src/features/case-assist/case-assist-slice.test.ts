import {Action} from '@reduxjs/toolkit';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseInformationValue,
} from './case-assist-actions';
import {caseAssistReducer} from './case-assist-slice';
import {CaseAssistState, getCaseAssistInitialState} from './case-assist-state';

const rejectWithValue = (action: Action, payload: object) => ({
  type: action.type,
  meta: {
    requestId: 'some request id',
    rejectedWithValue: true,
    requestStatus: 'rejected',
    aborted: false,
    condition: false,
  },
  payload,
});

describe('case assist slice', () => {
  let state: CaseAssistState;

  beforeEach(() => {
    state = getCaseAssistInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = caseAssistReducer(undefined, {type: ''});

    expect(finalState).toEqual(getCaseAssistInitialState());
  });

  it('setCaseInformationValue sets the value in the state', () => {
    const expected = {field: 'subject', value: 'some case subject'};
    const action = setCaseInformationValue({
      fieldName: expected.field,
      fieldValue: expected.value,
    });
    const finalState = caseAssistReducer(state, action);

    expect(finalState.caseInformation[expected.field]).toBe(expected.value);
  });

  it('setCaseInformationValue can set many values in the state', () => {
    const actions = [
      setCaseInformationValue({
        fieldName: 'primaryColor',
        fieldValue: 'purple',
      }),
      setCaseInformationValue({
        fieldName: 'description',
        fieldValue: 'some description',
      }),
      setCaseInformationValue({
        fieldName: 'subject',
        fieldValue: 'some subject',
      }),
      setCaseInformationValue({
        fieldName: 'secondaryColor',
        fieldValue: 'teal',
      }),
    ];
    let finalState = state;

    actions.forEach((action) => {
      finalState = caseAssistReducer(finalState, action);
    });

    expect(finalState.caseInformation).toEqual({
      subject: 'some subject',
      description: 'some description',
      primaryColor: 'purple',
      secondaryColor: 'teal',
    });
  });

  it('getClassifications.pending raises the loading flag', () => {
    const action = getClassifications.pending('some request id');
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
      classifications,
      'some request id'
    );
    const finalState = caseAssistReducer(state, action);

    expect(finalState.classifications.loading).toBe(false);
    expect(finalState.classifications.fields).toEqual(classifications.fields);
    expect(finalState.classifications.responseId).toBe(
      classifications.responseId
    );
  });

  it('getClassifications.rejected stores the error', () => {
    const expectedError = {
      statusCode: 400,
      message: 'some value is missing',
      type: 'invalid request',
    };
    const action = rejectWithValue(getClassifications.rejected, {
      error: expectedError,
    });

    const finalState = caseAssistReducer(state, action);

    expect(finalState.classifications.error).toEqual(expectedError);
    expect(finalState.classifications.loading).toBe(false);
  });

  it('getDocumentSuggestions.pending raises the loading flag', () => {
    const action = getDocumentSuggestions.pending('some request id');
    const finalState = caseAssistReducer(state, action);

    expect(finalState.documentSuggestions.loading).toBe(true);
  });

  it('getDocumentSuggestions.fulfilled updates document suggestions', () => {
    const documentSuggestions = {
      documents: [],
      totalCount: 0,
      responseId: '94e4f770-c533-41a9-bb92-4463eaa83ba4',
    };
    const action = getDocumentSuggestions.fulfilled(
      documentSuggestions,
      'some request id'
    );
    const finalState = caseAssistReducer(state, action);

    expect(finalState.documentSuggestions.loading).toBe(false);
    expect(finalState.documentSuggestions).toMatchObject(documentSuggestions);
    expect(finalState.documentSuggestions.error).toBe(null);
  });

  it('getDocumentSuggestions.rejected stores the error', () => {
    const expectedError = {
      statusCode: 400,
      message: 'some value is missing',
      type: 'invalid request',
    };
    const action = rejectWithValue(getDocumentSuggestions.rejected, {
      error: expectedError,
    });

    const finalState = caseAssistReducer(state, action);

    expect(finalState.documentSuggestions.loading).toBe(false);
    expect(finalState.documentSuggestions.error).toEqual(expectedError);
  });
});

import {configuration} from '../../app/common-reducers.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {fetchCaseClassifications} from '../../features/case-field/case-field-actions.js';
import {caseFieldReducer as caseField} from '../../features/case-field/case-field-slice.js';
import {updateCaseInput} from '../../features/case-input/case-input-actions.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine.js';
import {
  CaseInput,
  CaseInputOptions,
  buildCaseInput,
} from './headless-case-input.js';

describe('Case Input', () => {
  let engine: MockCaseAssistEngine;
  let options: CaseInputOptions;
  let input: CaseInput;

  const testFieldName = 'testfield';

  function initCaseInput() {
    input = buildCaseInput(engine, {options});
  }

  beforeEach(() => {
    options = {
      field: testFieldName,
    };
    engine = buildMockCaseAssistEngine();
    initCaseInput();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      caseAssistConfiguration,
      caseInput,
      caseField,
      documentSuggestion,
    });
  });

  it('building a case input registers the input field in the state', () => {
    expect(engine.actions).toContainEqual(
      updateCaseInput({fieldName: testFieldName, fieldValue: ''})
    );
  });

  it('building a case input that was already registered does not register the input field again', () => {
    engine = buildMockCaseAssistEngine({
      state: {
        ...buildMockCaseAssistState(),
        caseInput: {
          [testFieldName]: {
            value: '',
          },
        },
      },
    });
    initCaseInput();
    expect(engine.actions).not.toContainEqual(
      updateCaseInput({fieldName: testFieldName, fieldValue: ''})
    );
  });

  it('building a case input specifying an empty field name throws', () => {
    options.field = '';
    expect(() => initCaseInput()).toThrow(
      'Check the options of buildCaseInput'
    );
  });

  describe('#update', () => {
    const testValue = 'test input value';

    it('dispatches a #updateCaseInput action with the passed input value', () => {
      const testValue = 'test input value';
      input.update(testValue);

      expect(engine.actions).toContainEqual(
        updateCaseInput({fieldName: testFieldName, fieldValue: testValue})
      );
    });

    it('dispatches a #logCaseFieldUpdate analytics action', () => {
      const testValue = 'test input value';
      input.update(testValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/case/field/update/pending',
        })
      );
    });

    it('dispatches a #fetchCaseClassifications action if requested', () => {
      input.update(testValue, {caseClassifications: true});

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchCaseClassifications.pending.type,
        })
      );
    });

    it('dispatches a #fetchDocumentSuggestions if requested', () => {
      input.update(testValue, {documentSuggestions: true});

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchDocumentSuggestions.pending.type,
        })
      );
    });

    it('dispatches both if requested', () => {
      input.update(testValue, {
        caseClassifications: true,
        documentSuggestions: true,
      });

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchCaseClassifications.pending.type,
        })
      );
      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchDocumentSuggestions.pending.type,
        })
      );
    });
  });
});

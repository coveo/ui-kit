import {
  caseAssistConfiguration,
  caseField,
  caseInput,
  configuration,
  documentSuggestion,
} from '../../app/reducers';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from '../../features/case-field/case-field-actions';
import {getCaseFieldInitialState} from '../../features/case-field/case-field-state';
import {fetchDocumentSuggestions} from '../../features/document-suggestion/document-suggestion-actions';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine';
import {
  buildCaseField,
  CaseField,
  CaseFieldOptions,
} from './headless-case-field';

describe('Case Field', () => {
  let engine: MockCaseAssistEngine;
  let options: CaseFieldOptions;
  let field: CaseField;

  const testFieldName = 'testField';

  function initCaseField() {
    field = buildCaseField(engine, {options});
  }

  beforeEach(() => {
    options = {
      field: testFieldName,
    };
    engine = buildMockCaseAssistEngine();
    initCaseField();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      configuration,
      caseAssistConfiguration,
      caseInput,
      caseField,
      documentSuggestion,
    });
  });

  it('building a case field registers the case field in the state', () => {
    expect(engine.actions).toContainEqual(
      registerCaseField({fieldName: testFieldName, fieldValue: ''})
    );
  });

  describe('#update', () => {
    const testValue = 'test case field value';

    beforeEach(() => {
      engine.state = {
        ...engine.state,
        caseField: {
          ...getCaseFieldInitialState(),
          fields: {
            [testFieldName]: {
              value: '',
              suggestions: [
                {
                  id: 'some-suggestion-id',
                  confidence: 0.987,
                  value: 'suggested value',
                },
              ],
            },
          },
        },
      };
    });

    it('dispatches a #logClassificationClick action when value is a suggestion and autoSelection is falsy', () => {
      field.update('suggested value');

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/classification/click/pending',
        })
      );
    });

    it('does not dispatch a #logClassificationClick action when value is not a suggestion', () => {
      field.update(testValue);

      expect(engine.actions).not.toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/classification/click/pending',
        })
      );
    });

    it('does not dispatch a #logClassificationClick action when value is a suggestion but autoSelection is truthy', () => {
      field.update(testValue, undefined, true);

      expect(engine.actions).not.toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/classification/click/pending',
        })
      );
    });

    it('dispatches a #updateCaseField action with the passed field value', () => {
      field.update(testValue);

      expect(engine.actions).toContainEqual(
        updateCaseField({fieldName: testFieldName, fieldValue: testValue})
      );
    });

    it('dispatches a #logCaseFieldUpdate analytics action when autoSelection is falsy', () => {
      field.update(testValue);

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/case/field/update/pending',
        })
      );
    });

    it('does not dispatch a #logCaseFieldUpdate analytics action when autoSelection is truthy', () => {
      field.update(testValue, undefined, true);

      expect(engine.actions).not.toContainEqual(
        expect.objectContaining({
          type: 'analytics/caseAssist/case/field/update/pending',
        })
      );
    });

    it('dispatches a #fetchCaseClassifications action when required', () => {
      field.update(testValue, {
        caseClassifications: true,
      });

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchCaseClassifications.pending.type,
        })
      );
    });

    it('dispatches a #fetchDocumentSuggestions action when required', () => {
      field.update(testValue, {
        documentSuggestions: true,
      });

      expect(engine.actions).toContainEqual(
        expect.objectContaining({
          type: fetchDocumentSuggestions.pending.type,
        })
      );
    });

    it('dispatches both #fetchCaseClassifications and #fetchDocumentSuggestions when required', () => {
      field.update(testValue, {
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

    it('does not dispatch #fetchCaseClassifications nor #fetchDocumentSuggestions when not required', () => {
      field.update(testValue);

      expect(engine.actions).not.toContainEqual(
        expect.objectContaining({
          type: fetchCaseClassifications.pending.type,
        })
      );
      expect(engine.actions).not.toContainEqual(
        expect.objectContaining({
          type: fetchDocumentSuggestions.pending.type,
        })
      );
    });
  });
});

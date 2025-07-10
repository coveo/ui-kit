import type {CaseAssistAppState} from '../../state/case-assist-app-state.js';
import {
  caseAssistCaseClassificationSelector,
  caseAssistCaseFieldValueSelector,
  caseAssistCaseInputValueSelector,
  caseAssistCaseSelector,
  caseAssistCustomCaseFieldValuesSelector,
  caseAssistCustomCaseInputValuesSelector,
  caseAssistDocumentSuggestionSelector,
  KnownCaseFields,
} from './case-assist-analytics-selectors.js';

const examplePermanentid = 'example permanent id';
const exampleSource = 'example source';
const exampleDocumentUrl = 'http://my.document.uri/clickable';
const exampleDocumentUriHash = 'document-uri-hash';
const exampleDocumentUri = 'http://my.document.uri';
const exampleDocumentTitle = 'My Document';
const exampleDocumentSuggestionId = 'document-id';
const exampleDocumentSuggestionResponseId =
  'last-document-suggestion-response-id';

describe('case assist analytics selectors', () => {
  const buildStateWithCaseInput = (): Partial<CaseAssistAppState> => ({
    caseInput: {
      id: {value: 'some-case-id'},
      subject: {value: 'some case subject'},
      description: {value: 'some case description'},
      productId: {value: 'some product ID'},
      customFieldA: {value: 'custom value'},
    },
  });

  const buildStateWithCaseField = (): Partial<CaseAssistAppState> => ({
    caseField: {
      status: {
        loading: false,
        error: null,
        lastResponseId: 'last-response-id',
      },
      fields: {
        category: {
          value: 'software',
          suggestions: [
            {
              id: 'software-suggestion-id',
              value: 'software',
              confidence: 0.987,
            },
            {
              id: 'service-suggestion-id',
              value: 'service',
              confidence: 0.765,
            },
          ],
        },
        customFieldB: {
          value: 'custom value',
          suggestions: [],
        },
      },
    },
  });

  const buildStateWithDocumentSuggestions =
    (): Partial<CaseAssistAppState> => ({
      documentSuggestion: {
        documents: [
          {
            uniqueId: exampleDocumentSuggestionId,
            clickUri: exampleDocumentUrl,
            excerpt: 'The content of my document',
            fields: {
              uri: exampleDocumentUri,
              urihash: exampleDocumentUriHash,
              permanentid: examplePermanentid,
              source: exampleSource,
            },
            hasHtmlVersion: false,
            title: exampleDocumentTitle,
          },
        ],
        status: {
          loading: false,
          error: null,
          lastResponseId: exampleDocumentSuggestionResponseId,
        },
      },
    });

  describe('#caseAssistCaseSelector', () => {
    it('should retrieve all the case information from the state', () => {
      const caseInfo = caseAssistCaseSelector({
        ...buildStateWithCaseInput(),
        ...buildStateWithCaseField(),
      });

      expect(caseInfo).toMatchObject({
        id: 'some-case-id',
        subject: 'some case subject',
        description: 'some case description',
        productId: 'some product ID',
        category: 'software',
        custom: {
          customFieldA: 'custom value',
          customFieldB: 'custom value',
        },
      });
    });
  });

  describe('#caseAssistCaseInputValueSelector', () => {
    it('should return the input value', () => {
      const value = caseAssistCaseInputValueSelector(
        buildStateWithCaseInput(),
        'subject'
      );

      expect(value).toBe('some case subject');
    });

    it('should return #undefined when field is not found', () => {
      const value = caseAssistCaseInputValueSelector(
        buildStateWithCaseInput(),
        'thisFieldDoesNotExist'
      );

      expect(value).toBeUndefined();
    });
  });

  describe('#caseAssistCustomCaseInputValueSelector', () => {
    it('should return all inputs except the known fields', () => {
      const customFields = caseAssistCustomCaseInputValuesSelector(
        buildStateWithCaseInput()
      );

      expect(customFields).toHaveProperty('customFieldA', 'custom value');
      Object.values(KnownCaseFields).forEach((knownCaseField) =>
        expect(customFields).not.toHaveProperty(knownCaseField)
      );
    });

    it('should return an empty object if no custom fields', () => {
      const state = buildStateWithCaseInput();
      delete state.caseInput!.customFieldA;

      const customFields = caseAssistCustomCaseInputValuesSelector(state);

      expect(Object.keys(customFields)).toHaveLength(0);
    });

    it('should return an empty object if custom field has no value', () => {
      const state = buildStateWithCaseInput();
      state.caseInput!.customFieldA.value = '';

      const customFields = caseAssistCustomCaseInputValuesSelector(state);

      expect(customFields).not.toHaveProperty('customFieldA');
    });
  });

  describe('#caseAssistCaseFieldValueSelector', () => {
    it('should return the field value', () => {
      const value = caseAssistCaseFieldValueSelector(
        buildStateWithCaseField(),
        'category'
      );

      expect(value).toBe('software');
    });

    it('should return #undefined when field is not found', () => {
      const value = caseAssistCaseFieldValueSelector(
        buildStateWithCaseField(),
        'thisFieldDoesNotExist'
      );

      expect(value).toBeUndefined();
    });
  });

  describe('#caseAssistCustomCaseFieldValueSelector', () => {
    it('should return all fields except the known ones', () => {
      const customFields = caseAssistCustomCaseFieldValuesSelector(
        buildStateWithCaseField()
      );

      expect(customFields).toHaveProperty('customFieldB', 'custom value');
      Object.values(KnownCaseFields).forEach((knownCaseField) =>
        expect(customFields).not.toHaveProperty(knownCaseField)
      );
    });

    it('should return an empty object if no custom fields', () => {
      const state = buildStateWithCaseField();
      delete state.caseField!.fields.customFieldB;

      const customFields = caseAssistCustomCaseFieldValuesSelector(state);

      expect(Object.keys(customFields)).toHaveLength(0);
    });

    it('should return an empty object if custom field has no value', () => {
      const state = buildStateWithCaseField();
      state.caseField!.fields.customFieldB.value = '';

      const customFields = caseAssistCustomCaseFieldValuesSelector(state);

      expect(customFields).not.toHaveProperty('customFieldB');
    });
  });

  describe('#caseAssistCaseClassificationSelector', () => {
    it('should return the classification matching the specified ID', () => {
      const classification = caseAssistCaseClassificationSelector(
        buildStateWithCaseField(),
        'service-suggestion-id'
      );

      expect(classification).toMatchObject({
        classificationId: 'service-suggestion-id',
        responseId: 'last-response-id',
        fieldName: 'category',
        classification: {
          value: 'service',
          confidence: 0.765,
        },
      });
    });

    it('should return the classification matching the specified ID with the field autoSelection when the autoSelection parameter is set to true', () => {
      const classification = caseAssistCaseClassificationSelector(
        buildStateWithCaseField(),
        'service-suggestion-id',
        true
      );

      expect(classification).toMatchObject({
        autoSelection: true,
        classificationId: 'service-suggestion-id',
        responseId: 'last-response-id',
        fieldName: 'category',
        classification: {
          value: 'service',
          confidence: 0.765,
        },
      });
    });

    it('should throw when the classification is not found', () => {
      expect(() =>
        caseAssistCaseClassificationSelector(
          buildStateWithCaseField(),
          'invalid-classification-id'
        )
      ).toThrow();
    });
  });

  describe('#caseAssistDocumentSuggestionSelector', () => {
    it('should return the document suggestion matching the specified ID', () => {
      const suggestion = caseAssistDocumentSuggestionSelector(
        buildStateWithDocumentSuggestions(),
        exampleDocumentSuggestionId
      );

      expect(suggestion).toMatchObject({
        responseId: exampleDocumentSuggestionResponseId,
        suggestionId: exampleDocumentSuggestionId,
        permanentId: examplePermanentid,
        suggestion: {
          documentPosition: 1,
          documentTitle: exampleDocumentTitle,
          documentUri: exampleDocumentUri,
          documentUriHash: exampleDocumentUriHash,
          documentUrl: exampleDocumentUrl,
          sourceName: exampleSource,
        },
      });
    });

    it('should return the document suggestion matching the specified ID with the field fromQuickview when the fromQuickview parameter is set to true', () => {
      const suggestion = caseAssistDocumentSuggestionSelector(
        buildStateWithDocumentSuggestions(),
        exampleDocumentSuggestionId,
        true
      );

      expect(suggestion).toMatchObject({
        responseId: exampleDocumentSuggestionResponseId,
        suggestionId: exampleDocumentSuggestionId,
        fromQuickview: true,
        suggestion: {
          documentPosition: 1,
          documentTitle: exampleDocumentTitle,
          documentUri: exampleDocumentUri,
          documentUriHash: exampleDocumentUriHash,
          documentUrl: exampleDocumentUrl,
        },
      });
    });

    it('should return the document suggestion matching the specified ID with the field openDocument when the openDocument parameter is set to true', () => {
      const suggestion = caseAssistDocumentSuggestionSelector(
        buildStateWithDocumentSuggestions(),
        exampleDocumentSuggestionId,
        false,
        true
      );

      expect(suggestion).toMatchObject({
        responseId: exampleDocumentSuggestionResponseId,
        suggestionId: exampleDocumentSuggestionId,
        openDocument: true,
        suggestion: {
          documentPosition: 1,
          documentTitle: exampleDocumentTitle,
          documentUri: exampleDocumentUri,
          documentUriHash: exampleDocumentUriHash,
          documentUrl: exampleDocumentUrl,
        },
      });
    });

    it('should throw when the document suggestion is not found', () => {
      expect(() =>
        caseAssistDocumentSuggestionSelector(
          buildStateWithDocumentSuggestions(),
          'some-invalid-suggestion-id',
          true
        )
      ).toThrow();
    });
  });
});

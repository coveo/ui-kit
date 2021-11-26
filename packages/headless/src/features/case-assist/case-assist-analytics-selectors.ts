import {CaseAssistAppState} from '../../state/case-assist-app-state';

export enum KnownCaseFields {
  id = 'id',
  subject = 'subject',
  description = 'description',
  category = 'category',
  productId = 'productId',
}

const isCustomFieldName = (fieldName: string) =>
  !(Object.values(KnownCaseFields) as string[]).includes(fieldName);

export const selectCase = (state: Partial<CaseAssistAppState>) => {
  const selectFieldValue = (fieldName: string) =>
    selectCaseInputValue(state, fieldName) ??
    selectCaseFieldValue(state, fieldName);

  return {
    id: selectFieldValue(KnownCaseFields.id),
    subject: selectFieldValue(KnownCaseFields.subject),
    description: selectFieldValue(KnownCaseFields.description),
    category: selectFieldValue(KnownCaseFields.category),
    productId: selectFieldValue(KnownCaseFields.productId),
    custom: {
      ...selectCustomCaseInputValues(state),
      ...selectCustomCaseFieldValues(state),
    },
  };
};

export const selectCaseInputValue = (
  state: Partial<CaseAssistAppState>,
  fieldName: string
) => state?.caseInput?.[fieldName]?.value;

export const selectCustomCaseInputValues = (
  state: Partial<CaseAssistAppState>
) =>
  Object.keys(state?.caseInput ?? []).reduce((customFields, fieldName) => {
    if (isCustomFieldName(fieldName)) {
      const value = state?.caseInput?.[fieldName]?.value;
      if (typeof value !== 'undefined') {
        return {...customFields, [fieldName]: value};
      }
    }

    return customFields;
  }, {});

export const selectCaseFieldValue = (
  state: Partial<CaseAssistAppState>,
  fieldName: string
) => state?.caseField?.fields[fieldName]?.value;

export const selectCustomCaseFieldValues = (
  state: Partial<CaseAssistAppState>
) =>
  Object.keys(state?.caseField?.fields ?? []).reduce(
    (customFields, fieldName) => {
      if (isCustomFieldName(fieldName)) {
        const value = state?.caseField?.fields?.[fieldName]?.value;
        if (typeof value !== 'undefined') {
          return {...customFields, [fieldName]: value};
        }
      }

      return customFields;
    },
    {}
  );

export const selectCaseClassification = (
  state: Partial<CaseAssistAppState>,
  classificationId: string
) => {
  const classificationFieldName = Object.keys(
    state?.caseField?.fields ?? []
  ).find((fieldName) =>
    state?.caseField?.fields[fieldName].suggestions.some(
      (suggestion) => suggestion.id === classificationId
    )
  );

  if (!classificationFieldName) {
    throw new Error(
      `Classification with ID '${classificationId}' could not be found.`
    );
  }

  const classificationField = state?.caseField?.fields[classificationFieldName];

  const classification = classificationField?.suggestions.find(
    (suggestion) => suggestion.id === classificationId
  );

  return {
    classificationId: classification?.id ?? '',
    responseId: state.caseField?.status.lastResponseId ?? '',
    fieldName: classificationFieldName,
    classification: {
      value: classification?.value ?? '',
      confidence: classification?.confidence ?? 0,
    },
  };
};

export const selectDocumentSuggestion = (
  _state: Partial<CaseAssistAppState>,
  _suggestionId: string
) => {
  // TODO: Retrieve the document suggestion information from the state
  return {
    suggestionId: '',
    responseId: '',
    suggestion: {
      documentUri: '',
      documentUriHash: '',
      documentTitle: '',
      documentUrl: '',
      documentPosition: 0,
    },
  };
};

import type {CaseAssistAppState} from '../../state/case-assist-app-state.js';

export enum KnownCaseFields {
  id = 'id',
  subject = 'subject',
  description = 'description',
  category = 'category',
  productId = 'productId',
}

const isCustomFieldName = (fieldName: string) =>
  !(Object.values(KnownCaseFields) as string[]).includes(fieldName);

export const caseAssistCaseSelector = (state: Partial<CaseAssistAppState>) => {
  const selectFieldValue = (fieldName: string) =>
    caseAssistCaseInputValueSelector(state, fieldName) ??
    caseAssistCaseFieldValueSelector(state, fieldName);

  return {
    id: selectFieldValue(KnownCaseFields.id),
    subject: selectFieldValue(KnownCaseFields.subject),
    description: selectFieldValue(KnownCaseFields.description),
    category: selectFieldValue(KnownCaseFields.category),
    productId: selectFieldValue(KnownCaseFields.productId),
    custom: {
      ...caseAssistCustomCaseInputValuesSelector(state),
      ...caseAssistCustomCaseFieldValuesSelector(state),
    },
  };
};

export const caseAssistCaseInputValueSelector = (
  state: Partial<CaseAssistAppState>,
  fieldName: string
) => state?.caseInput?.[fieldName]?.value;

export const caseAssistCustomCaseInputValuesSelector = (
  state: Partial<CaseAssistAppState>
) =>
  Object.keys(state?.caseInput ?? []).reduce((customFields, fieldName) => {
    if (isCustomFieldName(fieldName)) {
      const value = state?.caseInput?.[fieldName]?.value;
      if (value) {
        // biome-ignore lint/performance/noAccumulatingSpread: <>
        return {...customFields, [fieldName]: value};
      }
    }

    return customFields;
  }, {});

export const caseAssistCaseFieldValueSelector = (
  state: Partial<CaseAssistAppState>,
  fieldName: string
) => state?.caseField?.fields[fieldName]?.value;

export const caseAssistCustomCaseFieldValuesSelector = (
  state: Partial<CaseAssistAppState>
) =>
  Object.keys(state?.caseField?.fields ?? []).reduce(
    (customFields, fieldName) => {
      if (isCustomFieldName(fieldName)) {
        const value = state?.caseField?.fields?.[fieldName]?.value;
        if (value) {
          // biome-ignore lint/performance/noAccumulatingSpread: <>
          return {...customFields, [fieldName]: value};
        }
      }

      return customFields;
    },
    {}
  );

export const caseAssistCaseClassificationSelector = (
  state: Partial<CaseAssistAppState>,
  classificationId: string,
  autoSelection = false
) => {
  const classificationFieldName = Object.keys(
    state?.caseField?.fields ?? {}
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

  const result = {
    classificationId: classification?.id ?? '',
    responseId: state.caseField?.status.lastResponseId ?? '',
    fieldName: classificationFieldName,
    classification: {
      value: classification?.value ?? '',
      confidence: classification?.confidence ?? 0,
    },
  };

  if (autoSelection) {
    return {...result, autoSelection};
  }
  return result;
};

export const caseAssistDocumentSuggestionSelector = (
  state: Partial<CaseAssistAppState>,
  suggestionId: string,
  fromQuickview = false,
  openDocument = false
) => {
  let suggestionIdx: number | undefined;
  const suggestion = state.documentSuggestion?.documents.find((s, idx) => {
    const isFound = s.uniqueId === suggestionId;
    if (isFound) {
      suggestionIdx = idx + 1;
    }
    return isFound;
  });

  if (!suggestion) {
    throw new Error(
      `Document Suggestion with ID '${suggestionId}' could not be found.`
    );
  }

  const result = {
    suggestionId: suggestion.uniqueId,
    permanentId: suggestion.fields.permanentid,
    responseId: state.documentSuggestion?.status.lastResponseId ?? '',
    suggestion: {
      documentUri: suggestion.fields.uri,
      documentUriHash: suggestion.fields.urihash,
      documentTitle: suggestion.title,
      documentUrl: suggestion.clickUri,
      documentPosition: suggestionIdx ?? 0,
      sourceName: suggestion.fields.source,
    },
  };

  if (fromQuickview) {
    return {...result, fromQuickview};
  }
  if (openDocument) {
    return {...result, openDocument};
  }
  return result;
};

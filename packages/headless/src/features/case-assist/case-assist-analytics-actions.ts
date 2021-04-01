import {createAsyncThunk} from '@reduxjs/toolkit';
import {ThunkExtraArguments} from '../../app/store';
import {handleOneAnalyticsEvent} from 'coveo.analytics';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {
  getClassificationById,
  getDocumentSuggestionById,
} from './case-assist-selectors';
import {validatePayload} from '../../utils/validate-payload';
import {NumberValue, StringValue} from '@coveo/bueno';

export interface AsyncThunkOptions {
  state: CaseAssistAppState;
  extra: ThunkExtraArguments;
}

/**
 * Initializes the logger used for reporting ticket-related Usage Analytics events.
 * This action must be dispatched before any other ticket logging action.
 */
export const initializeTicketLogging = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions
>('analytics/caseAssist/initializeTicketLogging', (_, {getState}) => {
  const state = getState();
  handleOneAnalyticsEvent(
    'init',
    state.configuration.accessToken,
    state.configuration.analytics.apiBaseUrl
  );
});

/**
 * Logs the `ticket_create_start` event.
 */
export const logTicketCreateStart = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions
>('analytics/caseAssist/ticketCreateStart', () => {
  handleOneAnalyticsEvent('svc:setAction', 'ticket_create_start');
  handleOneAnalyticsEvent('send', 'event', 'svc', 'flowStart');
});

export interface LogTicketFieldUpdatedPayload {
  fieldName: string;
}

/**
 * Logs a `ticket_field_update` event.
 */
export const logTicketFieldUpdated = createAsyncThunk<
  void,
  LogTicketFieldUpdatedPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketFieldUpdated', (payload, {getState}) => {
  const validated = validatePayload(payload, {
    fieldName: new StringValue({required: true, emptyAllowed: false}),
  });

  updateWithCaseInformation(getState().caseAssist.caseInformation);
  handleOneAnalyticsEvent('svc:setAction', 'ticket_field_update', {
    fieldName: validated.payload.fieldName,
  });
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

export interface LogTicketClassificationClickPayload {
  predictionId: string;
}

/**
 * Logs a `ticket_classification_click` event.
 */
export const logTicketClassificationClick = createAsyncThunk<
  void,
  LogTicketClassificationClickPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketClassificationClick', (payload, {getState}) => {
  const validated = validatePayload(payload, {
    predictionId: new StringValue({required: true, emptyAllowed: false}),
  });
  const state = getState();
  const prediction = getClassificationById(
    state.caseAssist,
    validated.payload.predictionId
  );
  if (!prediction) {
    return;
  }

  updateWithCaseInformation(state.caseAssist.caseInformation);
  handleOneAnalyticsEvent('svc:setAction', 'ticket_classification_click', {
    classificationId: prediction.id,
    responseId: state.caseAssist.classifications.responseId,
    fieldName: prediction.fieldName,
    classification: {
      value: prediction.value,
      confidence: prediction.confidence,
    },
  });
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

/**
 * Logs a `ticket_next_stage` event.
 */
export const logTicketNextStage = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions
>('analytics/caseAssist/ticketNextStage', (_, {getState}) => {
  updateWithCaseInformation(getState().caseAssist.caseInformation);
  handleOneAnalyticsEvent('svc:setAction', 'ticket_next_stage');
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

export interface LogTicketDocumentSuggestionPayload {
  suggestionId: string;
}

/**
 * Logs a `suggestion_click` event.
 */
export const logTicketDocumentSuggestionClick = createAsyncThunk<
  void,
  LogTicketDocumentSuggestionPayload,
  AsyncThunkOptions
>(
  'analytics/caseAssist/ticketDocumentSuggestionClick',
  (payload, {getState}) => {
    const validated = validatePayload(payload, {
      suggestionId: new StringValue({required: true, emptyAllowed: false}),
    });

    const state = getState();
    const suggestion = getDocumentSuggestionById(
      state.caseAssist,
      validated.payload.suggestionId
    );
    if (!suggestion) {
      return;
    }

    handleOneAnalyticsEvent('svc:setAction', 'suggestion_click', {
      suggestionId: validated.payload.suggestionId,
      responseId: state.caseAssist.documentSuggestions.responseId,
      suggestion: {
        documentUri: suggestion.document.clickUri,
        documentUriHash: suggestion.document.fields['urihash'] ?? '',
        documentTitle: suggestion.document.title,
        documentUrl: suggestion.document.fields['uri'] ?? '',
        documentPosition: suggestion.position,
      },
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

export interface LogTicketDocumentSuggestionRatingPayload {
  suggestionId: string;
  rating: number;
}

/**
 * Logs a `suggestion_rate` event.
 */
export const logTicketDocumentSuggestionRating = createAsyncThunk<
  void,
  LogTicketDocumentSuggestionRatingPayload,
  AsyncThunkOptions
>(
  'analytics/caseAssist/ticketDocumentSuggestionRating',
  (payload, {getState}) => {
    const validated = validatePayload(payload, {
      suggestionId: new StringValue({required: true, emptyAllowed: false}),
      rating: new NumberValue({required: true, min: 0, max: 1}),
    });
    const state = getState();
    const suggestion = getDocumentSuggestionById(
      state.caseAssist,
      validated.payload.suggestionId
    );
    if (!suggestion) {
      return;
    }

    handleOneAnalyticsEvent('svc:setAction', 'suggestion_rate', {
      rate: validated.payload.rating,
      suggestionId: validated.payload.suggestionId,
      responseId: state.caseAssist.documentSuggestions.responseId,
      suggestion: {
        documentUri: suggestion.document.clickUri,
        documentUriHash: suggestion.document.fields['urihash'] ?? '',
        documentTitle: suggestion.document.title,
        documentUrl: suggestion.document.fields['uri'] ?? '',
        documentPosition: suggestion.position,
      },
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

/**
 * Logs a `ticket_cancel` event with the `Solved` reason.
 */
export const logTicketSolved = createAsyncThunk<void, void, AsyncThunkOptions>(
  'analytics/caseAssist/ticketSolved',
  () => {
    handleOneAnalyticsEvent('svc:setAction', 'ticket_cancel', {
      reason: 'Solved',
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

/**
 * Logs a `ticket_cancel` event with the `Quit` reason.
 */
export const logTicketCancelled = createAsyncThunk<
  void,
  void,
  AsyncThunkOptions
>('analytics/caseAssist/ticketCancelled', () => {
  handleOneAnalyticsEvent('svc:setAction', 'ticket_cancel', {reason: 'Quit'});
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

export interface LogTicketCreatedPayload {
  ticketId: string;
}

/**
 * Logs a `ticket_create` event.
 */
export const logTicketCreated = createAsyncThunk<
  void,
  LogTicketCreatedPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketCreated', (payload, {getState}) => {
  const validated = validatePayload(payload, {
    ticketId: new StringValue({required: true, emptyAllowed: false}),
  });

  updateWithCaseInformation(
    getState().caseAssist.caseInformation,
    validated.payload.ticketId
  );
  handleOneAnalyticsEvent('svc:setAction', 'ticket_create');
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

const updateWithCaseInformation = (
  caseInformation: Record<string, string>,
  ticketId?: string
) => {
  const {subject, description, ...rest} = caseInformation;

  let data: Record<string, unknown> = {
    id: ticketId,
    subject,
    description,
  };

  if (Object.keys(rest).length > 0) {
    data = {
      ...data,
      custom: {...rest},
    };
  }

  handleOneAnalyticsEvent('svc:setTicket', data);
};

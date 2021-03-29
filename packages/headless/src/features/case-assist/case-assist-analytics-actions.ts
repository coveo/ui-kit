import {createAsyncThunk} from '@reduxjs/toolkit';
import {ThunkExtraArguments} from '../../app/store';
import {handleOneAnalyticsEvent} from 'coveo.analytics';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {
  getClassificationById,
  getDocumentSuggestionById,
} from './case-assist-selectors';

export interface AsyncThunkOptions {
  state: CaseAssistAppState;
  extra: ThunkExtraArguments;
}

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

export const logTicketFieldUpdated = createAsyncThunk<
  void,
  LogTicketFieldUpdatedPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketFieldUpdated', (payload, {getState}) => {
  updateWithCaseInformation(getState().caseAssist.caseInformation);
  handleOneAnalyticsEvent('svc:setAction', 'ticket_field_update', {
    fieldName: payload.fieldName,
  });
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

export interface LogTicketClassificationClickPayload {
  predictionId: string;
}

export const logTicketClassificationClick = createAsyncThunk<
  void,
  LogTicketClassificationClickPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketClassificationClick', (payload, {getState}) => {
  const state = getState();

  console.log(
    `analytics/caseAssist/ticketClassificationClick: ${payload.predictionId}`
  );
  const prediction = getClassificationById(
    state.caseAssist,
    payload.predictionId
  );
  console.log(
    `analytics/caseAssist/ticketClassificationClick: prediction found: ${
      prediction !== undefined
    }`
  );
  if (!prediction) {
    return;
  }

  console.log(
    `analytics/caseAssist/ticketClassificationClick: prediction: ${JSON.stringify(
      prediction
    )}`
  );

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

export const logTicketDocumentSuggestionClick = createAsyncThunk<
  void,
  LogTicketDocumentSuggestionPayload,
  AsyncThunkOptions
>(
  'analytics/caseAssist/ticketDocumentSuggestionClick',
  ({suggestionId}, {getState}) => {
    const state = getState();
    const suggestion = getDocumentSuggestionById(
      state.caseAssist,
      suggestionId
    );
    if (!suggestion) {
      return;
    }

    handleOneAnalyticsEvent('svc:setAction', 'suggestion_click', {
      suggestionId,
      responseId: state.caseAssist.documentSuggestions.responseId,
      suggestion: {
        documentUri: suggestion.result.clickUri,
        documentUriHash: suggestion.result.raw.urihash,
        documentTitle: suggestion.result.title,
        documentUrl: suggestion.result.uri,
        documentPosition: suggestion.position,
      },
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

export const logTicketDocumentSuggestionUpvote = createAsyncThunk<
  void,
  LogTicketDocumentSuggestionPayload,
  AsyncThunkOptions
>(
  'analytics/caseAssist/ticketDocumentSuggestionUpvote',
  ({suggestionId}, {getState}) => {
    const state = getState();
    const suggestion = getDocumentSuggestionById(
      state.caseAssist,
      suggestionId
    );
    if (!suggestion) {
      return;
    }

    handleOneAnalyticsEvent('svc:setAction', 'suggestion_rate', {
      rate: 1,
      suggestionId,
      responseId: state.caseAssist.documentSuggestions.responseId,
      suggestion: {
        documentUri: suggestion.result.clickUri,
        documentUriHash: suggestion.result.raw.urihash,
        documentTitle: suggestion.result.title,
        documentUrl: suggestion.result.uri,
        documentPosition: suggestion.position,
      },
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

export const logTicketDocumentSuggestionDownvote = createAsyncThunk<
  void,
  LogTicketDocumentSuggestionPayload,
  AsyncThunkOptions
>(
  'analytics/caseAssist/ticketDocumentSuggestionDownvote',
  ({suggestionId}, {getState}) => {
    const state = getState();
    const suggestion = getDocumentSuggestionById(
      state.caseAssist,
      suggestionId
    );
    if (!suggestion) {
      return;
    }

    handleOneAnalyticsEvent('svc:setAction', 'suggestion_rate', {
      rate: 0,
      suggestionId,
      responseId: state.caseAssist.documentSuggestions.responseId,
      suggestion: {
        documentUri: suggestion.result.clickUri,
        documentUriHash: suggestion.result.raw.urihash,
        documentTitle: suggestion.result.title,
        documentUrl: suggestion.result.uri,
        documentPosition: suggestion.position,
      },
    });
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

export const logTicketSolved = createAsyncThunk<void, void, AsyncThunkOptions>(
  'analytics/caseAssist/ticketSolved',
  () => {
    handleOneAnalyticsEvent('svc:setAction', 'ticket_cancel');
    handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
  }
);

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

export const logTicketCreated = createAsyncThunk<
  void,
  LogTicketCreatedPayload,
  AsyncThunkOptions
>('analytics/caseAssist/ticketCreated', ({ticketId}, {getState}) => {
  updateWithCaseInformation(getState().caseAssist.caseInformation, ticketId);
  handleOneAnalyticsEvent('svc:setAction', 'ticket_create');
  handleOneAnalyticsEvent('send', 'event', 'svc', 'click');
});

const updateWithCaseInformation = (
  caseInformation: Record<string, string>,
  ticketId?: string
) => {
  const {subject, description, ...rest} = caseInformation;

  handleOneAnalyticsEvent('svc:setTicket', {
    subject,
    description,
    ticketId,
    custom: {...rest},
  });
};

import {
  baseInsightRequest,
  InsightParam,
  pickNonInsightParams,
} from '../insight-params';

export type InsightUserActionsRequest = InsightParam &
  TicketCreationDateParam &
  NumberSessionsBeforeParam &
  NumberSessionsAfterParam &
  MaximumSessionInactivityMinutesParam &
  ExcludedCustomActionsParam;

interface TicketCreationDateParam {
  ticketCreationDate?: string; // TODO: Make sure to indicate the exact date time format
}

interface NumberSessionsBeforeParam {
  numberSessionsBefore?: number;
}

interface NumberSessionsAfterParam {
  numberSessionsAfter?: number;
}

interface MaximumSessionInactivityMinutesParam {
  maximumSessionInactivityMinutes?: number;
}

interface ExcludedCustomActionsParam {
  excludedCustomActions?: string[];
}

export const buildInsightUserActionsRequest = (
  req: InsightUserActionsRequest
) => {
  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/useractions'),
    requestParams: pickNonInsightParams(req),
  };
};

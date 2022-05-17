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
  /**
   * The ticket creation date in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.
   */
  ticketCreationDate?: string;
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
  const params = pickNonInsightParams(
    req
  ) as Partial<InsightUserActionsRequest>;

  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/user-actions'),
    requestParams: {
      ticketCreationDate: params.ticketCreationDate,
      numberSessionsBefore: params.numberSessionsBefore ?? 50,
      numberSessionsAfter: params.numberSessionsAfter ?? 50,
      maximumSessionInactivityMinutes:
        params.maximumSessionInactivityMinutes ?? 30,
      excludedCustomActions: params.excludedCustomActions ?? [],
    },
  };
};

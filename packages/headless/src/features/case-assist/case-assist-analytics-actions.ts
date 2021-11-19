import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {makeCaseAssistAnalyticsAction} from '../analytics/analytics-utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractCaseFromState = (_state: Partial<CaseAssistAppState>) => {
  // TODO: At the moment we don't have what we need in the state
  // to return the case information, so we just return an empty ticket.
  return {};
};

export const logCaseStart = makeCaseAssistAnalyticsAction(
  'analytics/caseAssist/case/start',
  (client, state) =>
    client.logEnterInterface({
      ticket: extractCaseFromState(state),
    })
);

export const logUpdateCaseField = (fieldName: string) =>
  makeCaseAssistAnalyticsAction(
    'analytics/caseAssist/case/field/update',
    (client, state) =>
      client.logUpdateCaseField({
        fieldName,
        ticket: extractCaseFromState(state),
      })
  );

import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-actions';
import {
  partialDocumentInformation,
  documentIdentifier,
} from '../analytics/analytics-utils';
import {Result} from '../../api/search/search/result';
import {StringValue, RecordValue, Schema} from '@coveo/bueno';
import {Raw} from '../../api/search/search/raw';

const requiredNonEmptyString = new StringValue({
  required: true,
  emptyAllowed: false,
});
const rawPartialDefinition = {
  collection: requiredNonEmptyString,
  author: requiredNonEmptyString,
  urihash: requiredNonEmptyString,
  source: requiredNonEmptyString,
  permanentid: requiredNonEmptyString,
};
const resultPartialDefinition = {
  uniqueId: requiredNonEmptyString,
  raw: new RecordValue({values: rawPartialDefinition}),
  title: requiredNonEmptyString,
  uri: new StringValue({required: true, emptyAllowed: false, url: true}),
  clickUri: new StringValue({required: true, emptyAllowed: false, url: true}),
  rankingModifier: new StringValue({required: false, emptyAllowed: true}),
};

function partialRawPayload(raw: Raw): Partial<Raw> {
  return Object.assign(
    {},
    ...Object.keys(rawPartialDefinition).map((key) => ({[key]: raw[key]}))
  );
}

function partialResultPayload(result: Result): Partial<Result> {
  return Object.assign(
    {},
    ...Object.keys(resultPartialDefinition).map((key) => ({
      [key]: result[key as keyof typeof resultPartialDefinition],
    })),
    {raw: partialRawPayload(result.raw)}
  );
}

/**
 * Logs a click event with an `actionCause` value of `documentOpen`.
 * @param result (Result) The result that was opened.
 */
export const logDocumentOpen = (result: Result) =>
  makeAnalyticsAction(
    'analytics/result/open',
    AnalyticsType.Click,
    (client, state) => {
      new Schema(resultPartialDefinition).validate(
        partialResultPayload(result)
      );
      return client.logDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  )();

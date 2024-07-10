import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {
  RegisterRecentQueriesCreatorPayload,
  registerRecentQueriesPayloadDefinition,
} from '../../recent-queries/recent-queries-actions';

export const clearRecentQueries = createAction('commerce/recentQueries/clear');

export type RegisterRecentQueriesPayload = RegisterRecentQueriesCreatorPayload;

export const registerRecentQueries = createAction(
  'commerce/recentQueries/register',
  (payload: RegisterRecentQueriesPayload) =>
    validatePayload(payload, registerRecentQueriesPayloadDefinition)
);

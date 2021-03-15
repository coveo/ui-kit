import {createAction} from '@reduxjs/toolkit';

export type CaseFields = {[field: string]: string};

export const updateClassifications = createAction(
  'caseAssist/updateClassifications',
  // TODO: Validate the action payload by calling validatePayload with the appropriate schema.
  (payload: CaseFields) => ({payload: payload})
);

import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';

const stringValue = new StringValue({required: true});

export const sseReceived = createAction(
  'generatedAnswer/sseReceived',
  (text: string) => validatePayload(text, stringValue)
);

export const sseError = createAction('generatedAnswer/sseError');

export const sseComplete = createAction('generatedAnswer/sseComplete');

export const resetAnswer = createAction('generatedAnswer/resetAnswer');

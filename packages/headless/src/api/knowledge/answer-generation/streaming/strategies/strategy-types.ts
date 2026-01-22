import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import type {Message, PayloadType} from '../../shared-types.js';

type EventType = PayloadType | 'error';

export interface StreamingStrategy<TState> {
  handleOpen: (
    response: Response,
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>
  ) => void;

  handleClose?: (
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>
  ) => void;

  handleError: (error: unknown) => void;

  handleMessage: Partial<
    Record<
      EventType,
      (
        message: Required<Message>,
        dispatch: ThunkDispatch<TState, unknown, UnknownAction>
      ) => void
    >
  >;
}

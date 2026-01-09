import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import type {Message, PayloadType} from '../../shared-types.js';

type EventType = PayloadType | 'error';

export interface StreamingStrategy<TDraft, TState> {
  buildEndpointUrl: (state: TState) => string;

  events: {
    handleOpen: (
      response: Response,
      updateCachedData: (updater: (draft: TDraft) => void) => void,
      dispatch: ThunkDispatch<TState, unknown, UnknownAction>
    ) => void;

    handleClose: (
      updateCachedData: (updater: (draft: TDraft) => void) => void,
      dispatch: ThunkDispatch<TState, unknown, UnknownAction>
    ) => void;

    handleError: (error: unknown) => void;

    handleMessage: Partial<
      Record<
        EventType,
        (
          message: Required<Message>,
          updateCachedData: (updater: (draft: TDraft) => void) => void,
          dispatch: ThunkDispatch<TState, unknown, UnknownAction>
        ) => void
      >
    >;
  };
}

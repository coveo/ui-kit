import {useEffect, useRef, useState} from 'react';
import type {
  ConversationControllerMessage,
  ConversationControllerState,
  ConversationControllerTurn,
} from '@coveo/headless-future';

export interface ConversationEventEntry {
  id: number;
  type: string;
  payload: unknown;
}

interface DerivedConversationEvent {
  type: string;
  payload: unknown;
}

export function useConversationEventLog(state: ConversationControllerState) {
  const [entries, setEntries] = useState<ConversationEventEntry[]>([]);
  const previousStateRef = useRef(state);

  useEffect(() => {
    const previousState = previousStateRef.current;
    const nextEvents = deriveConversationEvents(previousState, state);

    if (nextEvents.length > 0) {
      setEntries((currentEntries) => {
        const mappedEntries = nextEvents.map((event, index) => ({
          id: Date.now() + index,
          ...event,
        }));

        return [...currentEntries, ...mappedEntries].slice(-80);
      });
    }

    previousStateRef.current = state;
  }, [state]);

  return entries;
}

function deriveConversationEvents(
  previousState: ConversationControllerState,
  currentState: ConversationControllerState
): DerivedConversationEvent[] {
  const nextEvents: DerivedConversationEvent[] = [];

  appendLifecycleEvents(previousState, currentState, nextEvents);
  appendTurnStatusEvents(previousState, currentState, nextEvents);
  appendAgentMessageEvents(previousState, currentState, nextEvents);

  if (currentState.error && currentState.error !== previousState.error) {
    nextEvents.push({
      type: 'endpoint_error',
      payload: {message: currentState.error},
    });
  }

  return nextEvents;
}

function appendLifecycleEvents(
  previousState: ConversationControllerState,
  currentState: ConversationControllerState,
  events: DerivedConversationEvent[]
) {
  if (!previousState.activeTurnId && currentState.activeTurnId) {
    events.push({
      type: 'turn_started',
      payload: {turnId: currentState.activeTurnId},
    });
  }

  if (
    previousState.streaming.isConnected !== currentState.streaming.isConnected
  ) {
    events.push({
      type: currentState.streaming.isConnected
        ? 'stream_connected'
        : 'stream_disconnected',
      payload: {isConnected: currentState.streaming.isConnected},
    });
  }
}

function appendTurnStatusEvents(
  previousState: ConversationControllerState,
  currentState: ConversationControllerState,
  events: DerivedConversationEvent[]
) {
  for (const turn of currentState.turns) {
    const previousTurn = previousState.turns.find(
      (candidate: ConversationControllerTurn) => candidate.id === turn.id
    );

    if (!previousTurn || previousTurn.status.type !== turn.status.type) {
      events.push({
        type: turn.status.type,
        payload: {
          turnId: turn.id,
          ...(turn.status.reason ? {reason: turn.status.reason} : {}),
        },
      });
    }
  }
}

function appendAgentMessageEvents(
  previousState: ConversationControllerState,
  currentState: ConversationControllerState,
  events: DerivedConversationEvent[]
) {
  for (const message of currentState.messages) {
    if (message.role !== 'agent') {
      continue;
    }

    const previousMessage = previousState.messages.find(
      (candidate: ConversationControllerMessage) => candidate.id === message.id
    );

    if (!previousMessage) {
      if (message.content) {
        events.push({
          type: 'TEXT_MESSAGE_CONTENT',
          payload: {delta: message.content},
        });
      }
      continue;
    }

    if (message.content === previousMessage.content) {
      continue;
    }

    const delta = message.content.startsWith(previousMessage.content)
      ? message.content.slice(previousMessage.content.length)
      : message.content;

    events.push({
      type: 'TEXT_MESSAGE_CONTENT',
      payload: {delta},
    });
  }
}

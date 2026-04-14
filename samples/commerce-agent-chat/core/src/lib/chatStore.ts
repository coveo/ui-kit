import {createStore, type StoreApi} from 'zustand/vanilla';

import type {ChatState, Message, ParsedEvent} from '../types/agent.js';

import {generateId} from './chatIds.js';
import {applyJsonPatch} from './jsonPatch.js';

export interface ChatSessionState extends ChatState {
  threadState: Record<string, unknown>;
  activityOwnershipById: Record<string, ActivityOwnership>;
}

export type ActivityOwner = 'backend' | 'client';

export interface ActivityOwnership {
  owner: ActivityOwner;
  activityType: string;
  threadId: string;
  updatedAt: number;
}

export interface StartedChatTurn {
  userMessage: Message;
  assistantMessage: Message;
}

export type ChatSessionStore = StoreApi<ChatSessionState>;

export function createChatSessionStore(
  threadId = generateId('thread')
): ChatSessionStore {
  return createStore<ChatSessionState>(() =>
    createInitialChatSessionState(threadId)
  );
}

export function createPendingChatTurn(content: string): StartedChatTurn {
  return {
    userMessage: {
      id: generateId('msg-user'),
      role: 'user',
      content,
    },
    assistantMessage: {
      id: generateId('msg-assistant'),
      role: 'assistant',
      content: '',
    },
  };
}

export function beginChatTurn(
  store: ChatSessionStore,
  turn: StartedChatTurn
): void {
  store.setState((state) => ({
    ...state,
    messages: [...state.messages, turn.userMessage, turn.assistantMessage],
    isLoading: true,
    progressSteps: [],
    progressTrace: [],
    error: null,
  }));
}

export function replaceChatState(
  store: ChatSessionStore,
  nextState: ChatState
): void {
  store.setState((state) => ({
    ...nextState,
    threadState: state.threadState,
    activityOwnershipById: state.activityOwnershipById,
  }));
}

export function setChatLoading(
  store: ChatSessionStore,
  isLoading: boolean
): void {
  store.setState((state) => ({
    ...state,
    isLoading,
  }));
}

export function setChatError(
  store: ChatSessionStore,
  error: string | null
): void {
  store.setState((state) => ({
    ...state,
    error,
  }));
}

export function updateProgressSteps(
  store: ChatSessionStore,
  updater: (current: string[]) => string[]
): void {
  store.setState((state) => ({
    ...state,
    progressSteps: updater(state.progressSteps),
  }));
}

export function updateProgressTrace(
  store: ChatSessionStore,
  updater: (current: ChatState['progressTrace']) => ChatState['progressTrace']
): void {
  store.setState((state) => ({
    ...state,
    progressTrace: updater(state.progressTrace),
  }));
}

export function appendAssistantText(
  store: ChatSessionStore,
  assistantMessageId: string,
  content: string
): void {
  if (!content) {
    return;
  }

  store.setState((state) => ({
    ...state,
    messages: state.messages.map((message) =>
      message.id === assistantMessageId
        ? {...message, content: `${message.content}${content}`}
        : message
    ),
  }));
}

export function upsertAssistantActivitySnapshot(
  store: ChatSessionStore,
  assistantMessageId: string,
  snapshot: {
    messageId: string;
    activityType: string;
    content: Record<string, unknown>;
  }
): void {
  store.setState((state) => ({
    ...state,
    messages: state.messages.map((message) => {
      if (message.id !== assistantMessageId) {
        return message;
      }

      const existing = message.activities ?? [];
      const alreadyHas = existing.some(
        (activity) => activity.id === snapshot.messageId
      );
      const newActivities = alreadyHas
        ? existing.map((activity) =>
            activity.id === snapshot.messageId
              ? {...activity, content: snapshot.content}
              : activity
          )
        : [
            ...existing,
            {
              id: snapshot.messageId,
              activityType: snapshot.activityType,
              content: snapshot.content,
            },
          ];

      return {
        ...message,
        activities: newActivities,
      };
    }),
  }));
}

export function applyAssistantActivityDelta(
  store: ChatSessionStore,
  assistantMessageId: string,
  delta: {
    messageId: string;
    activityType: string;
    patch: unknown[];
  }
): boolean {
  const ownership = getActivityOwnership(store, delta.messageId);
  if (ownership?.owner === 'client') {
    return false;
  }

  store.setState((state) => ({
    ...state,
    messages: state.messages.map((message) => {
      if (message.id !== assistantMessageId) {
        return message;
      }

      return {
        ...message,
        activities: (message.activities ?? []).map((activity) =>
          activity.id === delta.messageId
            ? {
                ...activity,
                content: applyJsonPatch(activity.content, delta.patch),
              }
            : activity
        ),
      };
    }),
  }));

  return true;
}

export function applyParsedEventToStore(
  store: ChatSessionStore,
  assistantMessageId: string,
  parsed: ParsedEvent
): void {
  if (parsed.type === 'message' && parsed.content) {
    appendAssistantText(store, assistantMessageId, parsed.content);
    return;
  }

  if (parsed.type === 'activity_snapshot' && parsed.activitySnapshot) {
    upsertAssistantActivitySnapshot(
      store,
      assistantMessageId,
      parsed.activitySnapshot
    );
    markBackendOwnedActivityFromParsedEvent(store, parsed);
    return;
  }

  if (parsed.type === 'activity_delta' && parsed.activityDelta) {
    const didApply = applyAssistantActivityDelta(
      store,
      assistantMessageId,
      parsed.activityDelta
    );
    if (didApply) {
      markBackendOwnedActivityFromParsedEvent(store, parsed);
    }
    return;
  }

  if (parsed.type === 'error') {
    setChatError(store, parsed.error ?? 'Unknown error');
  }
}

export function clearChatSession(store: ChatSessionStore): void {
  store.setState(createInitialChatSessionState());
}

export function dismissChatError(store: ChatSessionStore): void {
  store.setState((state) => ({
    ...state,
    error: null,
  }));
}

export function setThreadStateSnapshot(
  store: ChatSessionStore,
  snapshot: Record<string, unknown>
): void {
  store.setState((state) => ({
    ...state,
    threadState: snapshot,
  }));
}

export function applyThreadStateDelta(
  store: ChatSessionStore,
  patch: unknown[]
): void {
  store.setState((state) => ({
    ...state,
    threadState: applyJsonPatch(state.threadState, patch),
  }));
}

export function setActivityOwner(
  store: ChatSessionStore,
  activityId: string,
  owner: ActivityOwner,
  activityType = 'unknown'
): void {
  const id = activityId.trim();
  if (!id) {
    return;
  }

  store.setState((state) => {
    const existing = state.activityOwnershipById[id];

    return {
      ...state,
      activityOwnershipById: {
        ...state.activityOwnershipById,
        [id]: {
          owner,
          activityType: existing?.activityType ?? activityType,
          threadId: state.threadId,
          updatedAt: Date.now(),
        },
      },
    };
  });
}

export function markBackendOwnedActivityFromParsedEvent(
  store: ChatSessionStore,
  parsed: ParsedEvent
): void {
  if (parsed.type === 'activity_snapshot' && parsed.activitySnapshot) {
    setActivityOwner(
      store,
      parsed.activitySnapshot.messageId,
      'backend',
      parsed.activitySnapshot.activityType
    );
    return;
  }

  if (parsed.type === 'activity_delta' && parsed.activityDelta) {
    setActivityOwner(
      store,
      parsed.activityDelta.messageId,
      'backend',
      parsed.activityDelta.activityType
    );
  }
}

export function getActivityOwnership(
  store: ChatSessionStore,
  activityId: string
): ActivityOwnership | undefined {
  return store.getState().activityOwnershipById[activityId];
}

export function selectChatState(store: ChatSessionStore): ChatState {
  return toChatState(store.getState());
}

export function toChatState(state: ChatSessionState): ChatState {
  const {messages, isLoading, progressSteps, progressTrace, error, threadId} =
    state;

  return {
    messages,
    isLoading,
    progressSteps,
    progressTrace,
    error,
    threadId,
  };
}

function createInitialChatSessionState(threadId = generateId('thread')) {
  return {
    messages: [],
    isLoading: false,
    progressSteps: [],
    progressTrace: [],
    error: null,
    threadId,
    threadState: {},
    activityOwnershipById: {},
  } satisfies ChatSessionState;
}

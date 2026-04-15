import {createStore, type StoreApi} from 'zustand/vanilla';

import type {CommerceConfig} from '../config/env.js';
import type {ChatState, Message, ParsedEvent} from '../types/agent.js';

import {generateId} from './chatIds.js';
import {applyJsonPatch} from './jsonPatch.js';

export interface SearchResult {
  id: string;
  image: string;
  title: string;
  price: string;
}

export interface SearchResultsState {
  data: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  page: number;
  hasMore: boolean;
}

export interface ChatSessionState extends ChatState {
  threadState: Record<string, unknown>;
  activityOwnershipById: Record<string, ActivityOwnership>;
  env: CommerceConfig | null;
  searchResults: SearchResultsState;
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

interface ActivityRef {
  assistantMessageId: string;
  activityType: string;
}

export type ChatSessionStore = StoreApi<ChatSessionState>;

export function createUnifiedSearchStore(
  threadId = generateId('thread'),
  env: CommerceConfig | null = null
): ChatSessionStore {
  return createStore<ChatSessionState>(() =>
    createInitialChatSessionState(threadId, env)
  );
}

// Backward compat alias
export const createChatSessionStore = createUnifiedSearchStore;

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
  },
  sourceOwner: ActivityOwner = 'backend'
): boolean {
  const ownership = getActivityOwnership(store, delta.messageId);

  if (sourceOwner === 'backend' && ownership?.owner === 'client') {
    return false;
  }

  if (sourceOwner === 'client' && ownership?.owner !== 'client') {
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

export function handoffActivityToClient(
  store: ChatSessionStore,
  activityId: string
): boolean {
  const ref = findActivityRef(store, activityId);
  if (!ref) {
    return false;
  }

  setActivityOwner(store, activityId, 'client', ref.activityType);
  return true;
}

export function applyClientActivityDeltaById(
  store: ChatSessionStore,
  activityId: string,
  patch: unknown[]
): boolean {
  const ref = findActivityRef(store, activityId);
  if (!ref) {
    return false;
  }

  return applyAssistantActivityDelta(
    store,
    ref.assistantMessageId,
    {
      messageId: activityId,
      activityType: ref.activityType,
      patch,
    },
    'client'
  );
}

export function setSearchResults(
  store: ChatSessionStore,
  results: SearchResult[],
  hasMore: boolean
): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      data: results,
      hasMore,
      loading: false,
      error: null,
    },
  }));
}

export function addSearchResults(
  store: ChatSessionStore,
  results: SearchResult[],
  hasMore: boolean
): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      data: [...state.searchResults.data, ...results],
      hasMore,
      loading: false,
      error: null,
      page: state.searchResults.page + 1,
    },
  }));
}

export function setSearchLoading(
  store: ChatSessionStore,
  loading: boolean
): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      loading,
    },
  }));
}

export function setSearchError(
  store: ChatSessionStore,
  error: string | null
): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      error,
      loading: false,
    },
  }));
}

export function setSearchQuery(store: ChatSessionStore, query: string): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      ...state.searchResults,
      query,
      page: 0,
      data: [],
      loading: false,
      error: null,
      hasMore: true,
    },
  }));
}

export function resetSearch(store: ChatSessionStore): void {
  store.setState((state) => ({
    ...state,
    searchResults: {
      data: [],
      loading: false,
      error: null,
      query: '',
      page: 0,
      hasMore: true,
    },
  }));
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

function createInitialChatSessionState(
  threadId = generateId('thread'),
  env: CommerceConfig | null = null
) {
  return {
    messages: [],
    isLoading: false,
    progressSteps: [],
    progressTrace: [],
    error: null,
    threadId,
    threadState: {},
    activityOwnershipById: {},
    env,
    searchResults: {
      data: [],
      loading: false,
      error: null,
      query: '',
      page: 0,
      hasMore: true,
    },
  } satisfies ChatSessionState;
}

function findActivityRef(
  store: ChatSessionStore,
  activityId: string
): ActivityRef | undefined {
  const id = activityId.trim();
  if (!id) {
    return undefined;
  }

  for (const message of store.getState().messages) {
    if (message.role !== 'assistant') {
      continue;
    }

    const activity = (message.activities ?? []).find((a) => a.id === id);
    if (activity) {
      return {
        assistantMessageId: message.id,
        activityType: activity.activityType,
      };
    }
  }

  return undefined;
}

import {onUnmounted, ref} from 'vue';

import type {CommerceConfig} from '@core/config/env.js';
import {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import {toChatState} from '@core/lib/chatStore.js';

export function useChat(config: CommerceConfig) {
  const orchestrator = new ChatSessionOrchestrator(config);
  const store = orchestrator.getStore();
  const state = ref(toChatState(store.getState()));

  const unsubscribe = store.subscribe((sessionState) => {
    state.value = toChatState(sessionState);
  });

  onUnmounted(() => {
    unsubscribe();
    orchestrator.dispose();
  });

  const sendMessage = (content: string) => {
    orchestrator.sendMessage(content);
  };

  const clearMessages = () => {
    orchestrator.clearMessages();
  };

  const dismissError = () => {
    orchestrator.dismissError();
  };

  return {state, sendMessage, clearMessages, dismissError};
}

import {onUnmounted, ref} from 'vue';

import type {CommerceConfig} from '@core/config/env.js';
import {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';

export function useChat(config: CommerceConfig) {
  const orchestrator = new ChatSessionOrchestrator(config);
  const state = ref(orchestrator.getState());

  const unsubscribe = orchestrator.subscribe((update) => {
    state.value = update.state;
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

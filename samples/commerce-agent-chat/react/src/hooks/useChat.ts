import {useCallback, useEffect, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';

import type {CommerceConfig} from '@core/config/env.js';
import {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import {toChatState} from '@core/lib/chatStore.js';

export function useChat(config: CommerceConfig) {
  const orchestrator = useMemo(
    () => new ChatSessionOrchestrator(config),
    [config]
  );
  const store = orchestrator.getStore();
  const [state, setState] = useState(() => toChatState(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(
      (sessionState, previousSessionState) => {
        const applyState = () => setState(toChatState(sessionState));
        if (
          sessionState.progressSteps !== previousSessionState.progressSteps ||
          sessionState.progressTrace !== previousSessionState.progressTrace
        ) {
          flushSync(applyState);
        } else {
          applyState();
        }
      }
    );

    return () => {
      unsubscribe();
      orchestrator.dispose();
    };
  }, [orchestrator, store]);

  const sendMessage = useCallback(
    (content: string) => {
      orchestrator.sendMessage(content);
    },
    [orchestrator]
  );

  const clearMessages = useCallback(() => {
    orchestrator.clearMessages();
  }, [orchestrator]);

  const dismissError = useCallback(() => {
    orchestrator.dismissError();
  }, [orchestrator]);

  return {state, sendMessage, clearMessages, dismissError};
}

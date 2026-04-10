import {useCallback, useEffect, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';

import type {CommerceConfig} from '../config/env.js';
import {ChatSessionOrchestrator} from '../lib/chatSessionOrchestrator.js';

export function useChat(config: CommerceConfig) {
  const orchestrator = useMemo(
    () => new ChatSessionOrchestrator(config),
    [config]
  );
  const [state, setState] = useState(() => orchestrator.getState());

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe((update) => {
      const applyState = () => setState(update.state);
      if (update.immediate) {
        flushSync(applyState);
      } else {
        applyState();
      }
    });

    return () => {
      unsubscribe();
      orchestrator.dispose();
    };
  }, [orchestrator]);

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

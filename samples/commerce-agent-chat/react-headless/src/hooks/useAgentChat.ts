import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  AgentChat,
  AgentChatControllerState,
} from '@coveo/headless/commerce';

export function useAgentChat(controller: AgentChat) {
  const [state, setState] = useState<AgentChatControllerState>(
    () => controller.state
  );
  const controllerRef = useRef(controller);
  controllerRef.current = controller;

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      setState(controller.state);
    });
    return unsubscribe;
  }, [controller]);

  const sendMessage = useCallback(
    (content: string) => controllerRef.current.sendMessage(content),
    []
  );

  const clearConversation = useCallback(
    () => controllerRef.current.clearConversation(),
    []
  );

  const dismissError = useCallback(
    () => controllerRef.current.dismissError(),
    []
  );

  return {state, sendMessage, clearConversation, dismissError};
}

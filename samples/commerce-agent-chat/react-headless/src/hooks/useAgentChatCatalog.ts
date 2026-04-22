import {useEffect, useRef, useState} from 'react';
import type {
  AgentChatCatalog,
  AgentChatCatalogControllerState,
} from '@coveo/headless/commerce';

export function useAgentChatCatalog(controller: AgentChatCatalog) {
  const [state, setState] = useState<AgentChatCatalogControllerState>(
    () => controller.state
  );
  const controllerRef = useRef(controller);
  controllerRef.current = controller;

  useEffect(() => {
    const unsubscribe = controllerRef.current.subscribe(() => {
      setState(controllerRef.current.state);
    });
    return unsubscribe;
  }, []);

  return {state};
}

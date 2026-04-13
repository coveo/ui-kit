import {useEffect, useRef} from 'react';
import type {NextAction} from '@core/types/commerce.js';

interface NextActionsBarProps {
  actions: NextAction[];
  isLoading?: boolean;
  onActionClick?: (prompt: string) => void;
}

interface NextActionsBarElement extends HTMLElement {
  actions: NextAction[];
  isLoading: boolean;
}

interface CommerceActionClickEventDetail {
  prompt: string;
}

export function NextActionsBar({
  actions,
  isLoading = false,
  onActionClick,
}: NextActionsBarProps) {
  const elementRef = useRef<NextActionsBarElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.actions = actions;
      elementRef.current.isLoading = isLoading;
    }
  }, [actions, isLoading]);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<CommerceActionClickEventDetail>;
      onActionClick?.(customEvent.detail.prompt);
    };

    elementRef.current.addEventListener('commerce-action-click', handler);
    return () => {
      elementRef.current?.removeEventListener('commerce-action-click', handler);
    };
  }, [onActionClick]);

  return <cac-next-actions-bar ref={elementRef} />;
}

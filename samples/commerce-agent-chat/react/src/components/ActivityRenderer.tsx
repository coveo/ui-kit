import type {ActivityMessage} from '@core/types/agent.js';
import {useEffect, useRef} from 'react';

interface CommerceActionClickEvent extends CustomEvent<{prompt: string}> {}

interface ActivityRendererProps {
  activity: ActivityMessage;
  isLoading?: boolean;
  onActionSelected?: (prompt: string) => void;
}

interface ActivityRendererElement extends HTMLElement {
  activity: ActivityMessage;
  isLoading: boolean;
}

export function ActivityRenderer({
  activity,
  isLoading = false,
  onActionSelected,
}: ActivityRendererProps): React.JSX.Element {
  const elementRef = useRef<ActivityRendererElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.activity = activity;
      elementRef.current.isLoading = isLoading;
    }
  }, [activity, isLoading]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onActionSelected) {
      return;
    }

    const handleActionClick = (event: Event) => {
      onActionSelected((event as CommerceActionClickEvent).detail.prompt);
    };

    element.addEventListener('commerce-action-click', handleActionClick);
    return () =>
      element.removeEventListener('commerce-action-click', handleActionClick);
  }, [onActionSelected]);

  return <cac-activity-renderer ref={elementRef} />;
}

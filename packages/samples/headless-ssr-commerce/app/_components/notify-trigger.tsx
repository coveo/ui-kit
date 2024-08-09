import {
  NotifyTrigger as NotifyTriggerController,
  NotifyTriggerState,
} from '@coveo/headless/commerce';
import {FunctionComponent, useCallback, useEffect, useState} from 'react';

interface NotifyTriggerProps {
  controller?: NotifyTriggerController;
  staticState: NotifyTriggerState;
}

// The notify trigger query example in the searchuisamples org is 'notify me'.
export const NotifyTrigger: FunctionComponent<NotifyTriggerProps> = ({
  controller,
  staticState,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  const notify = useCallback(() => {
    state.notifications.forEach((notification) => {
      alert(`Notification: ${notification}`);
    });
  }, [state.notifications]);

  useEffect(() => {
    notify();
  }, [notify]);

  return null;
};

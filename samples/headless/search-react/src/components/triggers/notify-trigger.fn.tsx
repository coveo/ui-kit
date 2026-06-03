import type {NotifyTrigger as HeadlessNotifyTrigger} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface HeadlessNotifyTriggerProps {
  controller: HeadlessNotifyTrigger;
}

export const NotifyTrigger: FunctionComponent<HeadlessNotifyTriggerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => updateState()), []);
  useEffect(() => notify(), [state.notifications]);

  const updateState = () => {
    setState(props.controller.state);
  };

  const notify = () => {
    state.notifications.forEach((notification) => {
      alert(`Notification: ${notification}`);
    });
  };

  return null;
};

// usage

/**
 * ```tsx
 * const controller = buildNotifyTrigger(engine);
 *
 * <NotifyTriggerFn controller={controller} />;
 * ```
 */

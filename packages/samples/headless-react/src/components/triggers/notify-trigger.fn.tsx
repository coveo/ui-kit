import {useEffect, useState, FunctionComponent} from 'react';
import {NotifyTrigger as HeadlessNotifyTrigger} from '@coveo/headless';

interface HeadlessNotifyTriggerProps {
  controller: HeadlessNotifyTrigger;
}

export const NotifyTrigger: FunctionComponent<HeadlessNotifyTriggerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => updateState()), []);
  useEffect(() => notify(), [state.notification]);

  const updateState = () => {
    setState(props.controller.state);
  };

  const notify = () => {
    if (state.notification) {
      alert('Notification: ' + state.notification);
    }
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

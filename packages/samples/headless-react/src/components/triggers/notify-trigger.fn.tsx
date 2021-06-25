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

  const updateState = () => {
    setState(props.controller.state);
  };

  return <div>The notification is: {state.notify}</div>;
};

// usage

/**
 * ```tsx
 * const controller = buildNotifyTrigger(engine);
 *
 * <NotifyTriggerFn controller={controller} />;
 * ```
 */

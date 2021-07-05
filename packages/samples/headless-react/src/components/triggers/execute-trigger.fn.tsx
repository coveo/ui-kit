import {useEffect, useState, FunctionComponent} from 'react';
import {ExecuteTrigger as HeadlessExecuteTrigger} from '@coveo/headless';

interface HeadlessExecuteTriggerProps {
  controller: HeadlessExecuteTrigger;
}

export const ExecuteTrigger: FunctionComponent<HeadlessExecuteTriggerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => updateState()), []);

  const updateState = () => {
    setState(props.controller.state);
  };

  if (state.name) {
    return (
      <div>
        The executed function is {state.name + ' '}
        with params: {state.params}
      </div>
    );
  }
  return null;
};

// usage

/**
 * ```tsx
 * const controller = buildExecuteTrigger(engine);
 *
 * <ExecuteTriggerFn controller={controller} />;
 * ```
 */

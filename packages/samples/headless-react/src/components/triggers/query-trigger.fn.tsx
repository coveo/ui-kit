import type {QueryTrigger as HeadlessQueryTrigger} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface HeadlessQueryTriggerProps {
  controller: HeadlessQueryTrigger;
}

export const QueryTrigger: FunctionComponent<HeadlessQueryTriggerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => updateState()), []);

  const updateState = () => {
    setState(props.controller.state);
  };

  if (state.wasQueryModified) {
    return (
      <div>
        The query changed from {state.originalQuery} to {state.newQuery}
      </div>
    );
  }
  return null;
};

// usage

/**
 * ```tsx
 * const controller = buildQueryTrigger(engine);
 *
 * <QueryTriggerFn controller={controller} />;
 * ```
 */

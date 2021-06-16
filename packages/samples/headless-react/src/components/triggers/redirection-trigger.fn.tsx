import {useEffect, useState, FunctionComponent} from 'react';
import {RedirectionTrigger as HeadlessRedirectionTrigger} from '@coveo/headless';

interface HeadlessRedirectionTriggerProps {
  controller: HeadlessRedirectionTrigger;
}

export const RedirectionTrigger: FunctionComponent<HeadlessRedirectionTriggerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state) {
    return null;
  }

  if (state.redirectTo) {
    window.location.href = state.redirectTo;
    return null;
  }

  return (
    <div>
      <button></button>
    </div>
  );
};

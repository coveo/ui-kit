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

  useEffect(() => controller.subscribe(() => redirect()), []);
  useEffect(() => redirect(), [state.redirectTo]);

  const redirect = () => {
    setState(props.controller.state);
    console.log(state);
    console.log(props.controller.state);
    if (state.redirectTo) {
      window.location.href = controller.state.redirectTo!;
    }
  };

  return null;
};

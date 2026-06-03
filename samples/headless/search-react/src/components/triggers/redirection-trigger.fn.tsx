import type {RedirectionTrigger as HeadlessRedirectionTrigger} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface HeadlessRedirectionTriggerProps {
  controller: HeadlessRedirectionTrigger;
}

export const RedirectionTrigger: FunctionComponent<
  HeadlessRedirectionTriggerProps
> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => redirect()), []);
  useEffect(() => redirect(), [state.redirectTo]);

  const redirect = () => {
    setState(props.controller.state);
    if (state.redirectTo) {
      window.location.replace(controller.state.redirectTo);
    }
  };

  return null;
};

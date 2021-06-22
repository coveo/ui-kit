import {useEffect, useState, FunctionComponent} from 'react';
import {QueryTrigger as HeadlessQueryTrigger} from '@coveo/headless';

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

  return null;
};

import type {QueryTrigger as HeadlessQueryTrigger} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IQueryTriggerProps {
  controller: HeadlessQueryTrigger;
}

// Submit the query 'query me' from the search box to activate the query trigger.
export default function QueryTrigger(props: IQueryTriggerProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state);
    });
  }, [controller]);

  if (!state.wasQueryModified) {
    return null;
  }

  return (
    <div className="QueryTrigger">
      <p>
        {' '}
        The query changed from <b>{state.originalQuery}</b> to{' '}
        <b>{state.newQuery}</b>
      </p>
    </div>
  );
}

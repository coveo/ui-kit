import {
  QueryTrigger as QueryTriggerController,
  QueryTriggerState,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface QueryTriggerProps {
  controller?: QueryTriggerController;
  staticState: QueryTriggerState;
}

// The query trigger query example in the searchuisamples org is 'query me'.
export default function QueryTrigger({
  controller,
  staticState,
}: QueryTriggerProps) {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  if (state.wasQueryModified) {
    return (
      <div>
        The query changed from {state.originalQuery} to {state.newQuery}
      </div>
    );
  }
  return null;
}

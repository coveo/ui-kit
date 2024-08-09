import {
  RedirectionTrigger as RedirectionTriggerController,
  RedirectionTriggerState,
} from '@coveo/headless/commerce';
import {useCallback, useEffect, useState} from 'react';

interface RedirectionTriggerProps {
  controller?: RedirectionTriggerController;
  staticState: RedirectionTriggerState;
}

// The redirection trigger query example in the searchuisamples org is 'redirect me'.
export default function RedirectionTrigger({
  controller,
  staticState,
}: RedirectionTriggerProps) {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  const redirect = useCallback(() => {
    if (state.redirectTo) {
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo]);

  useEffect(() => {
    redirect();
  }, [redirect]);

  return null;
}

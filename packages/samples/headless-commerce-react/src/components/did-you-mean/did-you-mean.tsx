import {DidYouMean as HeadlessDidYouMean} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IDidYouMeanProps {
  controller: HeadlessDidYouMean;
}

export default function DidYouMean(props: IDidYouMeanProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  if (!state.wasAutomaticallyCorrected) {
    return null;
  }

  return (
    <div>
      <p>
        No results for <b>{state.originalQuery}</b>
      </p>
      <p>
        Query was automatically corrected to <b>{state.wasCorrectedTo}</b>
      </p>
    </div>
  );
}

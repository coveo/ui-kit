import {
  ProductListingSummaryState,
  Summary as SummaryController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';

interface SummaryProps {
  staticState: ProductListingSummaryState;
  controller?: SummaryController;
}

export const Summary: FunctionComponent<SummaryProps> = ({
  staticState,
  controller,
}: SummaryProps) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return <>{state.totalNumberOfProducts}</>;
};

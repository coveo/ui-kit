import {Summary as HeadlessSummary} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ISummaryProps {
  controller: HeadlessSummary;
}

export default function Summary(props: ISummaryProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const getSummaryText = () => {
    const {firstProduct, lastProduct, totalNumberOfProducts} = state;
    return `Showing results ${firstProduct} - ${lastProduct} of ${totalNumberOfProducts}`;
  };

  return (
    <div className="Summary">
      <span>{getSummaryText()}</span>
    </div>
  );
}

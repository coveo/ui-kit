import {
  PopularViewedRecommendationsList as HeadlessRecommendationList,
  loadClickAnalyticsActions,
  ProductRecommendation,
} from '@coveo/headless/product-recommendation';
import {useEffect, useState, FunctionComponent, useContext} from 'react';
import {AppContext} from '../../context/engine';
import {filterProtocol} from '../../utils/filter-protocol';

interface RecommendationListProps {
  controller: HeadlessRecommendationList;
}

export const RecommendationList: FunctionComponent<RecommendationListProps> = (
  props
) => {
  const engine = useContext(AppContext).productRecommendationEngine;
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (state.error) {
    return (
      <div>
        <div>Oops {state.error.message}</div>
        <code>{JSON.stringify(state.error)}</code>
        <button onClick={() => controller.refresh()}>Try again</button>
      </div>
    );
  }

  if (!state.recommendations.length) {
    return <button onClick={() => controller.refresh()}>Refresh</button>;
  }

  const logClick = (recommendation: ProductRecommendation) => {
    if (!engine) {
      return;
    }

    const {logProductRecommendationOpen} = loadClickAnalyticsActions(engine);
    engine.dispatch(logProductRecommendationOpen(recommendation));
  };

  return (
    <div>
      <button onClick={() => controller.refresh()}>Refresh</button>
      <ul style={{textAlign: 'left'}}>
        {state.recommendations.map((recommendation) => (
          <li key={recommendation.permanentid}>
            <article>
              <h2>
                {/* Make sure to log analytics when the recommendation is clicked. */}
                <a
                  href={filterProtocol(recommendation.clickUri)} // Filters out dangerous URIs that can create XSS attacks such as `javascript:`.
                  onClick={() => logClick(recommendation)}
                  onContextMenu={() => logClick(recommendation)}
                  onMouseDown={() => logClick(recommendation)}
                  onMouseUp={() => logClick(recommendation)}
                >
                  {recommendation.ec_name}
                </a>
              </h2>
              <p>{recommendation.ec_shortdesc}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

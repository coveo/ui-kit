import {useEffect, useState, FunctionComponent} from 'react';
import {ResultLink} from '../result-list/result-link';
import {RecommendationList as HeadlessRecommendationList} from '@coveo/headless/recommendation';

interface RecommendationListProps {
  controller: HeadlessRecommendationList;
}

export const RecommendationList: FunctionComponent<RecommendationListProps> = (
  props
) => {
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

  return (
    <div>
      <button onClick={() => controller.refresh()}>Refresh</button>
      <ul style={{textAlign: 'left'}}>
        {state.recommendations.map((recommendation) => (
          <li key={recommendation.uniqueId}>
            <article>
              <h2>
                {/* Make sure to log analytics when the result link is clicked. */}
                <ResultLink result={recommendation}>
                  {recommendation.title}
                </ResultLink>
              </h2>
              <p>{recommendation.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildRecommendationList(recommendationEngine, {
 *   options: {id: 'Recommendation'},
 * });
 *
 * <RecommendationList controller={controller} />;
 * ```
 */

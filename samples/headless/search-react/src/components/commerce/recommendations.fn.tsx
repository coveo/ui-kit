import type {Recommendations as HeadlessRecommendations} from '@coveo/headless/commerce';
import {type FunctionComponent, useEffect, useState} from 'react';

interface RecommendationsProps {
  controller: HeadlessRecommendations;
}

export const Recommendations: FunctionComponent<RecommendationsProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.products.length) {
    return <button onClick={() => controller.refresh()}>Refresh</button>;
  }

  return (
    <ul>
      {state.products.map(({ec_name, clickUri, permanentid}) => (
        <li key={permanentid}>
          <a href={clickUri}>{ec_name}</a>
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildRecommendations(engine);
 *
 * <Recommendations controller={controller} />;
 * ```
 */

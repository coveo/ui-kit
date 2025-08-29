import type {RecentResultsList as HeadlessRecentResultsList} from '@coveo/headless';
import {useEffect, useState} from 'react';

interface RecentResultsProps {
  controller: HeadlessRecentResultsList;
}

export const RecentResultsList: React.FunctionComponent<RecentResultsProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <div>
      Recent results:
      <ul>
        {state.results.map((result) => (
          <li key={result.uniqueId}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
};

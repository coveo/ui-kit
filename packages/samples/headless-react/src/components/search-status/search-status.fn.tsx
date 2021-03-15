import {useEffect, useState, FunctionComponent} from 'react';
import {SearchStatus as HeadlessSearchStatus} from '@coveo/headless';

interface SearchStatusProps {
  controller: HeadlessSearchStatus;
}

export const SearchStatus: FunctionComponent<SearchStatusProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const {hasResults, firstSearchExecuted, isLoading} = state;

  if (!hasResults && !firstSearchExecuted && isLoading) {
    return <p>The first search ever is currently loading.</p>;
  }

  if (!hasResults && !firstSearchExecuted && !isLoading) {
    return <p>No search was ever executed.</p>;
  }

  if (!hasResults && firstSearchExecuted && isLoading) {
    <p>The previous search gave no results, but new ones are pending.</p>;
  }

  if (!hasResults && firstSearchExecuted && !isLoading) {
    return <p>A search was executed but gave no results.</p>;
  }

  if (hasResults && isLoading) {
    return <p>The previous search gave results, but new ones are loading.</p>;
  }

  if (hasResults && !isLoading) {
    return <p>There are results and no pending search.</p>;
  }

  // Unreachable. The code is structured this way to demonstrate possible states.
  return null;
};

// usage

/**
 * ```tsx
 * const controller = buildSearchStatus(engine);
 *
 * <SearchStatus controller={controller} />;
 * ```
 */

import {useEffect, useState, FunctionComponent} from 'react';
import {StandaloneSearchBox as HeadlessStandaloneSearchBox} from '@coveo/headless';

interface StandaloneSearchBoxProps {
  controller: HeadlessStandaloneSearchBox;
}

export const StandaloneSearchBox: FunctionComponent<StandaloneSearchBoxProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function getURIParameters() {
    const {redirectTo, value} = state;
    const query = encodeURIComponent(value);
    // The query pipeline can trigger different redirection URLs, as documented here: https://docs.coveo.com/en/1458/tune-relevance/trigger-query-pipeline-feature
    // Unless a redirect trigger is added, you won't need such conditions. These redirections are only verified here as an example.
    if (redirectTo === 'https://mywebsite.com/search') {
      return '/' + query;
    } else if (redirectTo === 'https://www.google.com') {
      return '?q=' + query;
    }
    return '?search=' + query;
  }

  function isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  if (!state) {
    return null;
  }

  if (state.redirectTo) {
    window.location.href = state.redirectTo + getURIParameters();
    return null;
  }

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => controller.updateText(e.target.value)}
        onKeyDown={(e) => isEnterKey(e) && controller.submit()}
      />
      <ul>
        {state.suggestions.map((suggestion) => {
          const value = suggestion.rawValue;
          return (
            <li key={value} onClick={() => controller.selectSuggestion(value)}>
              {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildStandaloneSearchBox(engine, {
 *   options: {redirectionUrl: 'https://mywebsite.com/search'},
 * });
 *
 * <StandaloneSearchBox controller={controller} />;
 * ```
 */

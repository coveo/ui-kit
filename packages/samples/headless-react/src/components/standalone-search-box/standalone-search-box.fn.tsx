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

  function isEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    return e.key === 'Enter';
  }

  if (!state) {
    return null;
  }

  if (state.redirectTo) {
    window.location.href = state.redirectTo;
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

import {
  StandaloneSearchBoxState,
  StandaloneSearchBox as StandaloneSearchBoxController,
} from '@coveo/headless/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useEffect, useState, FunctionComponent} from 'react';

interface StandaloneSearchBoxProps {
  staticState: StandaloneSearchBoxState;
  controller?: StandaloneSearchBoxController;
}

export const StandaloneSearchBox: FunctionComponent<
  StandaloneSearchBoxProps
> = ({staticState, controller}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo === '/search') {
      const url = `${state.redirectTo}#q=${encodeURIComponent(state.value)}`;
      router.push(url);
      controller?.afterRedirection();
    }
  }, [state.redirectTo, state.value, router, controller]);
  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => controller?.updateText(e.target.value)}
      ></input>
      {state.value !== '' && (
        <span>
          <button onClick={controller?.clear}>X</button>
        </span>
      )}
      <button onClick={() => controller?.submit()}>Search</button>
      {state.suggestions.length > 0 && (
        <ul>
          {state.suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                onClick={() =>
                  controller?.selectSuggestion(suggestion.rawValue)
                }
                dangerouslySetInnerHTML={{__html: suggestion.highlightedValue}}
              ></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

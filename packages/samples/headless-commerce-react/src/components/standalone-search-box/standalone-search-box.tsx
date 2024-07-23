import {StandaloneSearchBox as HeadlessStandaloneSearchBox} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IStandaloneSearchBoxProps {
  navigate: (url: string) => void;
  controller: HeadlessStandaloneSearchBox;
}

export default function StandaloneSearchBox(props: IStandaloneSearchBoxProps) {
  const {navigate, controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.state.value && controller.clear();
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  useEffect(() => {
    if (state.redirectTo === '/search') {
      navigate(`${state.redirectTo}#q=${state.value}`);
      controller.afterRedirection();
    } else if (state.redirectTo !== '') {
      navigate(state.redirectTo);
    }
  }, [state.redirectTo, navigate, state.value, controller]);

  return (
    <div className="StandaloneSearchbox">
      <input
        className="SearchBoxInput"
        value={state.value}
        onChange={(e) => controller.updateText(e.target.value)}
      ></input>
      {state.value !== '' && (
        <span className="SearchBoxClear">
          <button onClick={controller.clear}>X</button>
        </span>
      )}
      <button onClick={() => controller.submit()}>Search</button>
      {state.suggestions.length > 0 && (
        <ul className="QuerySuggestions">
          {state.suggestions.map((suggestion, index) => (
            <li key={index} className="QuerySuggestion">
              <button
                onClick={() => controller.selectSuggestion(suggestion.rawValue)}
                dangerouslySetInnerHTML={{__html: suggestion.highlightedValue}}
              ></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

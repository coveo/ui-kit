import {SearchBox as HeadlessSearchBox} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ISearchBoxProps {
  controller: HeadlessSearchBox;
}

export default function SearchBox(props: ISearchBoxProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.state.value && controller.clear();
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  return (
    <div className="Searchbox">
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
      <button onClick={controller.submit}>Search</button>
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

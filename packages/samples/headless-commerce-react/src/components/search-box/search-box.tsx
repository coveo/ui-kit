import {
  SearchBox as HeadlessSearchBox,
  InstantProducts as HeadlessInstantProducts,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import InstantProducts from '../instant-products/instant-products';

interface ISearchBoxProps {
  controller: HeadlessSearchBox;
  instantProductsController: HeadlessInstantProducts;
  navigate: (pathName: string) => void;
}

export default function SearchBox(props: ISearchBoxProps) {
  const {controller, instantProductsController, navigate} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.state.value && controller.clear();
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    controller.updateText(e.target.value);
    instantProductsController.updateQuery(e.target.value);
  };

  return (
    <div className="Searchbox">
      <input
        className="SearchBoxInput"
        value={state.value}
        onChange={(e) => onSearchBoxInputChange(e)}
      ></input>
      {state.value !== '' && (
        <span className="SearchBoxClear">
          <button onClick={controller.clear}>X</button>
        </span>
      )}
      <button onClick={controller.submit}>Search</button>
      <table>
        <thead>
          <tr>
            <th>Query suggestions</th>
            <th>Instant products</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {state.suggestions.length > 0 && (
                <ul className="QuerySuggestions">
                  {state.suggestions.map((suggestion, index) => (
                    <li key={index} className="QuerySuggestion">
                      <button
                        onMouseEnter={() =>
                          instantProductsController.updateQuery(
                            suggestion.rawValue
                          )
                        }
                        onClick={() =>
                          controller.selectSuggestion(suggestion.rawValue)
                        }
                        dangerouslySetInnerHTML={{
                          __html: suggestion.highlightedValue,
                        }}
                      ></button>
                    </li>
                  ))}
                </ul>
              )}
            </td>
            <td>
              <InstantProducts
                controller={instantProductsController}
                navigate={navigate}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

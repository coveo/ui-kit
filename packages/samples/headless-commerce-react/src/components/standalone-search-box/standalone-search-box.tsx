import {
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  InstantProducts as HeadlessInstantProducts,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import InstantProducts from '../instant-products/instant-products';

interface IStandaloneSearchBoxProps {
  navigate: (url: string) => void;
  controller: HeadlessStandaloneSearchBox;
  instantProductsController: HeadlessInstantProducts;
}

export default function StandaloneSearchBox(props: IStandaloneSearchBoxProps) {
  const {navigate, controller, instantProductsController} = props;

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
      window.location.href = state.redirectTo;
    }
  }, [state.redirectTo, navigate, state.value, controller]);

  const onSearchBoxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    controller.updateText(e.target.value);
    instantProductsController.updateQuery(e.target.value);
  };

  return (
    <div className="StandaloneSearchbox">
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
      <button onClick={() => controller.submit()}>Search</button>
      {state.suggestions.length > 0 && (
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
      )}
    </div>
  );
}

import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';

interface SearchBoxProps {
  ssrState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  ssrState,
  controller,
}) => {
  const [state, setState] = useState(ssrState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <form
      className="search-box"
      onSubmit={(e) => {
        e.preventDefault();
        controller?.submit();
      }}
    >
      <input
        value={state.value}
        onChange={(e) => controller?.updateText(e.target.value)}
      />
    </form>
  );
};

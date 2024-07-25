import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';

interface SearchBoxProps {
  staticState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = ({
  staticState,
  controller,
}: SearchBoxProps) => {
  const [state, setState] = useState(staticState);

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

import {SearchBoxState} from '@coveo/headless';
import {FunctionComponent} from 'react';

export const StaticSearchBox: FunctionComponent<{
  state: SearchBoxState;
  onChange?: (newValue: string) => void;
}> = ({state, onChange}) => {
  return (
    <>
      <input
        defaultValue={state.value}
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
      <button type="submit">Search</button>
    </>
  );
};

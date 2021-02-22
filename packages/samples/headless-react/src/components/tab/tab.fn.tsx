import {useEffect, useState, FunctionComponent} from 'react';
import {buildTab, Tab as HeadlessTab} from '@coveo/headless';
import {engine} from '../../engine';

interface TabProps {
  controller: HeadlessTab;
}

export const Tab: FunctionComponent<TabProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <button disabled={state.isActive} onClick={() => controller.select()}>
      {props.children}
    </button>
  );
};

// usage

const controller = buildTab(engine, {
  // initialState: {isActive: true},
  options: {expression: '@objecttype==Message'},
});

<Tab controller={controller}>Messages</Tab>;

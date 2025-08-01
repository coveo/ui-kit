import type {Tab as HeadlessTab} from '@coveo/headless';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';

interface TabProps extends PropsWithChildren {
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

/* Usage

const messageExpression = buildQueryExpression()
  .addStringField({
    field: 'objecttype',
    operator: 'isExactly',
    values: ['Message'],
  })
  .toQuerySyntax();

const controller = buildTab(engine, {
  initialState: {isActive: true},
  options: {
    id: 'messages',
    expression: messageExpression,
  },
});

<Tab controller={controller}>Messages</Tab>;
*/

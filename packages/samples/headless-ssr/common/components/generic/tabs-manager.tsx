import {
  TabManagerState,
  TabManager as TabManagerController,
} from '@coveo/headless-react/ssr';
import {useEffect, useState, FunctionComponent} from 'react';
import TabManagerCommon from '../common/tab-manager';

interface TabManagerProps {
  staticState: TabManagerState;
  controller?: TabManagerController;
  children: React.ReactNode;
}

export const TabManager: FunctionComponent<TabManagerProps> = ({
  staticState,
  controller,
  children,
}: TabManagerProps) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <TabManagerCommon
      controller={controller}
      value={state.activeTab}
      children={children}
    />
  );
};

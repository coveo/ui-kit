'use client';

import type {Tab as TabController, TabState} from '@coveo/headless/ssr-next';
import TabCommon from '../common/tab';
import {useControllerState} from './use-controller-state';

interface TabProps {
  label: string;
  staticState: TabState;
  controller?: TabController;
}

export default function Tab({label, staticState, controller}: TabProps) {
  const state = useControllerState(staticState, controller);

  return (
    <TabCommon
      label={label}
      isActive={state.isActive}
      onSelect={controller && (() => controller.select())}
    />
  );
}

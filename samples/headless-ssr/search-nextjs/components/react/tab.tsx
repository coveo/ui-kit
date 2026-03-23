'use client';

import {
  useTabAll,
  useTabCountries,
  useTabManager,
  useTabVideos,
} from '../../lib/react/engine';
import TabCommon from '../common/tab';

export default function Tab({
  tabName,
  tabLabel,
}: {
  tabName: string;
  tabLabel: string;
}) {
  const tabManager = useTabManager();

  // biome-ignore lint/suspicious/noImplicitAnyLet: <>
  let controller;

  if (tabName === 'all') {
    controller = useTabAll;
  } else if (tabName === 'countries') {
    controller = useTabCountries;
  } else if (tabName === 'videos') {
    controller = useTabVideos;
  } else {
    throw new Error(`Unknown tab: ${tabName}`);
  }

  const {state, methods} = controller();

  return (
    <TabCommon
      state={state}
      methods={methods}
      activeTab={tabManager.state.activeTab}
      tabName={tabName}
      tabLabel={tabLabel}
    />
  );
}

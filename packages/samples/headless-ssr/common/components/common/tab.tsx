import {Tab, TabManager, TabState} from '@coveo/headless/ssr';

interface TabCommonProps {
  state: TabState;
  methods: Omit<Tab, 'state' | 'subscribe'> | undefined;
  tabManager?: TabManager;
  tabName: string;
  tabLabel: string;
}

export default function TabCommon({
  state,
  methods,
  tabManager,
  tabName,
  tabLabel,
}: TabCommonProps) {
  function handleClickTab() {
    if (tabManager?.state.activeTab !== tabName) methods?.select();
  }

  return (
    <button
      role="tab"
      aria-selected={state.isActive}
      key={tabName}
      onClick={() => handleClickTab()}
    >
      {state.isActive ? <strong>{tabLabel}</strong> : tabLabel}
    </button>
  );
}

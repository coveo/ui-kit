import type {Tab, TabState} from '@coveo/headless/ssr';

interface TabCommonProps {
  state: TabState;
  methods: Omit<Tab, 'state' | 'subscribe'> | undefined;
  activeTab: string;
  tabName: string;
  tabLabel: string;
}

export default function TabCommon({
  state,
  methods,
  activeTab,
  tabName,
  tabLabel,
}: TabCommonProps) {
  function handleClickTab() {
    if (activeTab !== tabName) methods?.select();
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={state.isActive}
      key={tabName}
      onClick={() => handleClickTab()}
    >
      {state.isActive ? <strong>{tabLabel}</strong> : tabLabel}
    </button>
  );
}

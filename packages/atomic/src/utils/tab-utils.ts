import {SearchParametersState} from '@coveo/headless';

export function getActiveTab(
  state: Partial<SearchParametersState>
): {tab: string} | null {
  const activeTab = Object.values(state.tabSet ?? {}).find(
    (tab) => tab.isActive
  );
  return activeTab ? {tab: activeTab.id} : null;
}

export function shouldDisplayOnCurrentTab(
  tabs: string,
  state: Partial<SearchParametersState>
) {
  const activeTab = getActiveTab(state)?.tab;
  if (!activeTab) {
    return true;
  }

  const tabList = tabs.split(';');
  const includeTabs: (string | undefined)[] = [];
  const excludeTabs: (string | undefined)[] = [];

  tabList.forEach((tab) => {
    if (tab.startsWith('!')) {
      excludeTabs.push(tab.slice(1));
    } else {
      includeTabs.push(tab);
    }
  });

  const isIncluded =
    includeTabs.length === 0 || includeTabs.includes(activeTab);
  const isNotExcluded =
    excludeTabs.length === 0 || !excludeTabs.includes(activeTab);

  return isIncluded && isNotExcluded;
}

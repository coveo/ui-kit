import {TabSetState} from '@coveo/headless/dist/definitions/features/tab-set/tab-set-state';
import {FunctionalComponent, h} from '@stencil/core';
import {shouldDisplayOnCurrentTab} from '../../../utils/tab-utils';

const TabVisibilityWrapper: FunctionalComponent<{
  tabsIncluded: string[];
  tabsExcluded: string[];
  tabState: Partial<TabSetState>;
}> = ({tabsIncluded, tabsExcluded, tabState: tabSetState}, children) => {
  const shouldDisplay = shouldDisplayOnCurrentTab(
    tabsIncluded,
    tabsExcluded,
    tabSetState
  );

  return <div hidden={shouldDisplay}>{children}</div>;
};

export default TabVisibilityWrapper;

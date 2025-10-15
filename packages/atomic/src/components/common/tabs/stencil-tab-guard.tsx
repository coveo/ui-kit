import {nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {shouldDisplayOnCurrentTab} from '@/src/utils/tab-utils';

interface TabGuardProps {
  tabsIncluded: string | string[];
  tabsExcluded: string | string[];
  activeTab: string;
}

export const TabGuard: FunctionalComponentWithChildren<TabGuardProps> =
  ({props}) =>
  (children) => {
    const {tabsIncluded, tabsExcluded, activeTab} = props;

    if (
      !shouldDisplayOnCurrentTab(
        [...tabsIncluded],
        [...tabsExcluded],
        activeTab
      )
    ) {
      return nothing;
    }

    return children;
  };

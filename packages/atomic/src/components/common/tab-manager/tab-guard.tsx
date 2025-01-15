import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {shouldDisplayOnCurrentTab} from '../../../utils/tab-utils';
import {Hidden} from '../stencil-hidden';

interface TabGuardProps {
  tabsIncluded: string | string[];
  tabsExcluded: string | string[];
  activeTab: string;
}

export const TabGuard: FunctionalComponent<TabGuardProps> = (
  {tabsIncluded, tabsExcluded, activeTab},
  children
) => {
  if (
    !shouldDisplayOnCurrentTab([...tabsIncluded], [...tabsExcluded], activeTab)
  ) {
    return <Hidden></Hidden>;
  }
  return <Fragment>{...children}</Fragment>;
};

import {SearchAppState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {shouldDisplayOnCurrentTab} from '../../../utils/tab-utils';

const TabVisibilityWrapper: FunctionalComponent<{
  tabs: string;
  engineState: Partial<SearchAppState>;
}> = ({tabs, engineState}, children) => {
  const shouldDisplay = shouldDisplayOnCurrentTab(tabs, engineState);

  return <div hidden={shouldDisplay}>{children}</div>;
};

export default TabVisibilityWrapper;

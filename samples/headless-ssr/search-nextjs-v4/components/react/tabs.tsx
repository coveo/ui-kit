'use client';

import {useTabAll, useTabCountries, useTabVideos} from '@/lib/react/engine';
import TabCommon from '../common/tab';

export default function Tabs() {
  const tabs = [
    {label: 'All', ...useTabAll()},
    {label: 'Countries', ...useTabCountries()},
    {label: 'Videos', ...useTabVideos()},
  ];

  return (
    <div role="tablist">
      {tabs.map(({label, state, methods}) => (
        <TabCommon
          key={label}
          label={label}
          isActive={state.isActive}
          onSelect={methods && (() => methods.select())}
        />
      ))}
    </div>
  );
}

'use client';

import TabManagerCommon from '../common/tab-manager';
import Tab from './tab';

export default function TabManager() {
  return (
    <TabManagerCommon>
      <Tab tabName={'all'} tabLabel="All"></Tab>
      <Tab tabName={'countries'} tabLabel="Countries"></Tab>
      <Tab tabName={'videos'} tabLabel="Videos"></Tab>
    </TabManagerCommon>
  );
}

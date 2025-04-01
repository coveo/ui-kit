import {TabManager as TabManagerController} from '@coveo/headless/ssr';

interface TabManagerCommonProps {
  controller: Omit<TabManagerController, 'state' | 'subscribe'> | undefined;
  value: string;
  children: React.ReactNode;
}

export default function TabManagerCommon({
  controller,
  value,
  children,
}: TabManagerCommonProps) {
  return <div role="tablist">{children}</div>;
}

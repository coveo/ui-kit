interface TabManagerCommonProps {
  children: React.ReactNode;
}

export default function TabManagerCommon({children}: TabManagerCommonProps) {
  return <div role="tablist">{children}</div>;
}

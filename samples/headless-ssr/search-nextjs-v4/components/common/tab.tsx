interface TabCommonProps {
  label: string;
  isActive: boolean;
  onSelect?(): void;
}

export default function TabCommon({label, isActive, onSelect}: TabCommonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => !isActive && onSelect?.()}
    >
      {isActive ? <strong>{label}</strong> : label}
    </button>
  );
}

export function FileIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.5 2.5H5.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
      <path d="M11.5 2.5V7H16" />
      <line x1="7" y1="10.5" x2="13" y2="10.5" />
      <line x1="7" y1="13.5" x2="13" y2="13.5" />
    </svg>
  );
}

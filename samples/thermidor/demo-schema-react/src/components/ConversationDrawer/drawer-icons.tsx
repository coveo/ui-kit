import type {ReactNode} from 'react';

function Icon({children, className}: {children: ReactNode; className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ComposeIcon() {
  return (
    <Icon>
      <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
    </Icon>
  );
}

/** A wheel the size of the other icons, which `className` spins. */
export function SpinnerIcon({className}: {className?: string}) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="8" opacity="0.25" />
      <path d="M12 4a8 8 0 0 1 8 8" />
    </Icon>
  );
}

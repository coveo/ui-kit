import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    display: block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .timeline {
    @apply flex flex-col gap-1 py-1 text-sm font-light;
    color: var(--atomic-neutral-dark);
  }

  .step {
    @apply flex items-center gap-2;
  }

  .collapsed-timeline-summary {
    @apply flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left;
    font: inherit;
    color: inherit;
  }

  .collapsed-timeline-summary:focus-visible {
    @apply rounded outline-2 outline-offset-2;
    outline-color: var(--atomic-primary);
  }

  .toggle-button {
    @apply flex cursor-pointer items-center gap-1 border-none bg-transparent p-0;
    font: inherit;
    color: inherit;
  }

  .toggle-button:focus-visible {
    @apply rounded outline-2 outline-offset-2;
    outline-color: var(--atomic-primary);
  }

  .step-icon {
    @apply flex shrink-0 items-center justify-center;
    width: 14px;
    height: 14px;
  }

  .checkmark-icon {
    color: var(--atomic-success, #1b8057);
  }

  .spinner {
    @apply inline-block rounded-full;
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }

  .chevron {
    @apply ml-1 flex items-center;
    transition: transform 0.2s ease;
  }

  .chevron-up {
    transform: rotate(180deg);
  }
`;

export default styles;

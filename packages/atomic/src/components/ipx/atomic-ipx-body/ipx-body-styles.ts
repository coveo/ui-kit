import {css} from 'lit';

/**
 * Shared styles for IPX body component that cannot be expressed in Tailwind.
 * Must be included in the static styles of parent components using renderIpxBody.
 */
export const ipxBodyStyles = css`
  .ipx-body-container {
    height: inherit;
    max-height: calc(100vh - 4.25rem);
    box-shadow: rgb(0 0 0 / 50%) 0 0 0.5rem;
  }

  /* Scrollbar - Chrome, Edge & Safari */
  .ipx-body-scrollbar::-webkit-scrollbar {
    width: 0.8rem;
  }

  .ipx-body-scrollbar::-webkit-scrollbar-track {
    background: var(--atomic-background);
  }

  .ipx-body-scrollbar::-webkit-scrollbar-thumb {
    background: var(--atomic-primary);
    border: 0.15rem solid var(--atomic-background);
    border-radius: 100vh;
  }

  .ipx-body-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--atomic-primary-light);
  }

  /* Scrollbar - Firefox */
  .ipx-body-scrollbar {
    scrollbar-color: var(--atomic-primary) var(--atomic-background);
    scrollbar-width: auto;
  }
`;

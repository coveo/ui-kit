import {css} from 'lit';

export const ipxBodyStyles = css`
  .ipx-body-container {
    height: inherit;
    max-height: calc(100vh - 4.25rem);
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

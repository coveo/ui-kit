import {css} from 'lit';

const styles = css`
  [part='copy-button'] .icon-container atomic-icon:hover {
    @apply text-primary;
  }

  [part='copy-button'].copied .icon-container atomic-icon {
    @apply text-success;
  }

  [part='copy-button'].error .icon-container atomic-icon {
    @apply text-error;
  }
`;

export default styles;

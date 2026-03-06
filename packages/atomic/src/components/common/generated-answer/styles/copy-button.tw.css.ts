import {css} from 'lit';

const styles = css`
  [part='copy-button'] .icon-container atomic-icon:hover {
    color: var(--atomic-primary);
  }

  [part='copy-button'].copied .icon-container atomic-icon {
    color: var(--atomic-success);
  }

  [part='copy-button'].error .icon-container atomic-icon {
    color: var(--atomic-error);
  }

  [part='copy-button'] .icon-container {
    line-height: 0;
  }
`;

export default styles;

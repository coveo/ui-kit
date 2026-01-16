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

    [part='copy-button'] {
      width: 2.2rem;
      height: 2.2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    [part='copy-button'] .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 0;
    }

    [part='copy-button'] .icon-container atomic-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
`;

export default styles;

import {css} from 'lit';

const styles = css`
  /* @reference '../../../utils/coveo.tw.css'; */

  :host {
    display: grid;
  }

  .list-root.display-table {
    @apply atomic-result-table border-neutral rounded-xl border;

    thead tr,
    tbody tr:not(:last-child) {
      position: relative;

      &::after {
        content: ' ';
        display: block;
        position: absolute;
        height: 1px;
        bottom: 0;
        left: var(--padding);
        right: var(--padding);
        @apply bg-neutral;
      }
    }

    th,
    td {
      border-color: transparent;
      border-radius: initial;
    }

    th {
      background-color: transparent;
    }
  }
`;

export default styles;

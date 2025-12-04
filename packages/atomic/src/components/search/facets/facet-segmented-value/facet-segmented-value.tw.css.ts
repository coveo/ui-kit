import {css} from 'lit';

export default css`
  li:first-child .value-box {
    @apply rounded-l;
  }

  li:last-child .value-box {
    @apply rounded-r;
  }

  .value-label {
    max-width: 15ch;
  }
`;

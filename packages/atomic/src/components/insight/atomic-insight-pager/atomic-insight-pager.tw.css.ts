import {css} from 'lit';

export default css`
  @reference '../../../utils/coveo.tw.css';

  [part='page-button'] {
    @apply bg-transparent;
  }

  :host {
    @apply bg-neutral-light box-content flex h-full items-center justify-center px-6 py-4;
  }
`;

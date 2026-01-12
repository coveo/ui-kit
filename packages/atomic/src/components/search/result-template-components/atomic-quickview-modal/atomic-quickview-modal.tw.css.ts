/* @reference '../../../../utils/coveo.tw.css'; */
import {css} from 'lit';

export default css`
  :host::part(backdrop) {
    grid-template-columns: 1fr max(80vw, 30rem) 1fr;
    grid-template-rows: 1fr 100% 3fr;
  }

  :host::part(body),
  :host::part(header),
  :host::part(footer) {
    @apply max-w-full;
  }

  :host::part(footer) {
    @apply flex justify-center;
  }

  :host::part(body-wrapper) {
    @apply h-full overflow-hidden p-0;
  }

  :host::part(body) {
    @apply h-full;
  }

  :host::part(header-wrapper) {
    @apply bg-neutral-light;
  }

  a {
    text-decoration: underline;
    @apply text-primary hover:underline;
  }
`;

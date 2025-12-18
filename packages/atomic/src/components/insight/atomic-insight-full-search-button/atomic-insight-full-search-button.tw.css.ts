import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    @apply absolute right-0;
    --full-search-background-color: var(--atomic-neutral-dark);
    --full-search-secondary-background-color: #333536;
  }

  :host::part(full-search-button) {
    @apply size-[27px] rounded-none border-none;
    background-color: var(--full-search-background-color);
    clip-path: polygon(0 0, 100% 100%, 100% 0);
  }

  :host::part(full-search-button):hover {
    background-color: var(--full-search-secondary-background-color);
    border-color: var(--full-search-secondary-background-color);
  }

  :host::part(full-search-icon) {
    @apply absolute top-[4px] left-[15px] h-[9px] w-[9px];
  }
`;

export default styles;

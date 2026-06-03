import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    atomic-tab-bar::part(popover-button) {
      @apply m-0 px-2 pb-1 text-left text-xl font-normal text-black sm:px-6;
    }

    atomic-tab-bar::part(value-label) {
      @apply font-normal;
    }

    ::part(popover-tab) {
      @apply font-normal;
    }
  }
`;

export default styles;

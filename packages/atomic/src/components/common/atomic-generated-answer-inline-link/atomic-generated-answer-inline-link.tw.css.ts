import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    display: inline;
  }

  a {
    @apply text-primary underline;
  }

  a::after {
    content: '↗';
    @apply ms-1 inline-block no-underline;
  }
`;

export default styles;

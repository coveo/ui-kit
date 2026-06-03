import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
  @reference '../../../utils/tailwind-utilities/link-style.css';
  @reference '../../../utils/tailwind-utilities/set-font-size.css';

  [part='source-url'] {
    @apply link-style;
    @apply set-font-size-base;
  }

  [part='source-title'] {
    @apply link-style;
    @apply set-font-size-xl;
    @apply mb-6;
  }

  footer::before {
    content: ' ';
    display: block;
    height: 1px;
    @apply bg-neutral;
    margin-bottom: 1.5rem;
  }
`;

export default styles;

import {css} from 'lit';

export default css`
  @reference '../../../utils/tailwind.global.tw.css';
  [part='source-url'] {
    @apply link-style;
    @apply set-font-size-base;
  }

  [part='source-title'] {
    @apply link-style;
    @apply set-font-size-xl;
    @apply mb-6;
  }

  footer:before {
    content: ' ';
    display: block;
    height: 1px;
    @apply bg-neutral;
    margin-bottom: 1.5rem;
  }
`;

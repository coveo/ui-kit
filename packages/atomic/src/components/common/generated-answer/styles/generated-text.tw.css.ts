import {css} from 'lit';

const styles = css`
  @reference '../../../../utils/tailwind.global.tw.css';
  @reference '../../../../utils/tailwind-utilities/set-font-size.css';

  [part='generated-text'] {
    @apply set-font-size-base;
  }

  [part='generated-text'].cursor::after {
    content: '';
    width: 8px;
    height: 1em;
    margin-left: 0.1em;
    @apply bg-neutral-dark;
    display: inline-block;
    animation: cursor-blink 1.5s steps(2) infinite;
    vertical-align: text-bottom;
  }
`;

export default styles;

import {css} from 'lit';

const styles = css`
  @reference '../../../../utils/tailwind.global.tw.css';
  :host {
    display: block;
  }
  :host [part='footer']::before {
    content: ' ';
    display: block;
    height: 1px;
    @apply bg-neutral;
    margin-bottom: 1.5rem;
  }
  [part='answer-and-source'] {
    /*
    This negates some of the margin at the top of the rendered snippet.
    The rendered snippet has a minimum margin of 1rem, so this still leaves some of the margin.
  */
    margin-top: -0.5rem;
  }

  [part='source-title'],
  [part='source-url'] {
    @apply link-style;
    display: block;
  }

  [part='source-url'] {
    @apply set-font-size-base;
  }

  [part='source-title'] {
    @apply set-font-size-xl;
  }
`;

export default styles;

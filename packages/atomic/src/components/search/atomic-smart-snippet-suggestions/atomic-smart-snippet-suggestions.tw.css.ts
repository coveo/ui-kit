import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
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
  [part='source-url'] {
    @apply link-style;
    @apply set-font-size-base;
    display: block;
  }

  [part='source-title'] {
    @apply link-style;
    @apply set-font-size-xl;
    display: block;
  }
`;

export default styles;

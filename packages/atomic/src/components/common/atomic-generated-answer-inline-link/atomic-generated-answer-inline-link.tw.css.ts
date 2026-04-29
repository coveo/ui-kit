import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  :host {
    display: inline;
  }

  a {
    @apply text-primary no-underline;
  }

  a [part='answer-link-text'] {
    @apply underline;
  }

  .icon-wrapper {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: text-bottom;
  }
`;

export default styles;

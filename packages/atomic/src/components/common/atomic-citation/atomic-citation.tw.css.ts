import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
  @reference '../../../utils/tailwind-utilities/set-font-size.css';

  :host {
    position: relative;
    display: contents;
  }

  [part='citation'] {
    --height: 2.2em;
    --index-height: 1.1em;
    --max-citation-width: 400px;

    max-width: var(--max-citation-width);
    height: var(--height);
  }

  [part='citation-popover'] {
    --popover-width: 350px;

    width: var(--popover-width);

    p {
      @apply set-font-size-sm;
    }
  }
`;

export default styles;

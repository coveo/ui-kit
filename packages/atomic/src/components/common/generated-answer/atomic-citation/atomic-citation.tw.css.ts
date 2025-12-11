import {css} from 'lit';

const styles = css`
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
  }
}`;

export default styles;

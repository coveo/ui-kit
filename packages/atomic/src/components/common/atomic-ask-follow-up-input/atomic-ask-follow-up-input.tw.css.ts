import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  [part='input-container'] {
    /* Pin the container to the single-line height (textarea min-height + 2×1px border).
       When textarea-expander becomes position:absolute on expand it leaves normal flow,
       which would otherwise collapse the container and cause a layout jump. */
    min-height: calc(2.5rem + 2px);
  }

  [part='textarea-expander']::after {
    content: attr(data-replicated-value) ' ';
    visibility: hidden;
  }

  [part='textarea-expander'] > [part='input-field'],
  [part='textarea-expander']::after {
    @apply resize-none overflow-hidden whitespace-nowrap bg-transparent px-4 py-2 outline-none placeholder-neutral-dark hide-scrollbar;
    padding-right: 3rem;
    grid-area: 1 / 1 / 2 / 2;
    min-height: 2.5rem;
  }

  /* Expanded: absolute overlay anchored at the bottom so growth goes upward.*/
  [part='textarea-expander'].expanded {
    @apply bg-background rounded-md border border-primary ring-1 ring-primary overflow-visible;
    position: absolute;
    bottom: -1px;
    left: -1px;
    right: -1px;
    z-index: 10;
  }

  [part='textarea-expander'].expanded > [part='input-field'],
  [part='textarea-expander'].expanded::after {
    @apply whitespace-pre-wrap overflow-y-auto;
    max-height: 8rem;
  }

  /* Keep submit button above the expanded textarea overlay */
  [part='submit-button'] {
    z-index: 11;
  }
`;

export default styles;

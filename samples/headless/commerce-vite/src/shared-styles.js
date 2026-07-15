import {css} from 'lit';

/**
 * Style modules shared across components. Each component composes the ones it
 * needs into its own `static styles`, so styles stay encapsulated in each
 * shadow root. The palette lives in `style.css` as `:root` custom properties,
 * which inherit through shadow boundaries and are referenced here as
 * `var(--...)`.
 */

/** Base reset + shared element styling (links, buttons, focus rings). */
export const baseStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  img {
    max-width: 100%;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button {
    cursor: pointer;
    font: inherit;
    padding: 0.45rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  button:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const headingStyles = css`
  h2 {
    font-size: 1.2rem;
    margin: 0 0 1rem;
  }

  h3 {
    font-size: 0.95rem;
    margin: 0 0 0.6rem;
  }
`;

/** Search & listing layout: toolbar on top, facets left, results right. */
export const layoutStyles = css`
  .interface {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    grid-template-areas:
      'toolbar toolbar'
      'facets  results';
    column-gap: 1.75rem;
    row-gap: 1.25rem;
    align-items: start;
  }

  .toolbar {
    grid-area: toolbar;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .facets {
    grid-area: facets;
    min-width: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    box-shadow: var(--shadow-sm);
  }

  .results {
    grid-area: results;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 720px) {
    .interface {
      grid-template-columns: 1fr;
      grid-template-areas:
        'toolbar'
        'facets'
        'results';
    }
  }
`;

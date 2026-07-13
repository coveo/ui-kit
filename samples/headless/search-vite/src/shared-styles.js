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

  :host([hidden]) {
    display: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
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

/** Shared styling for the facet components (regular, category, date). */
export const facetStyles = css`
  h3 {
    margin: 0 0 0.6rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  li {
    list-style: none;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text);
  }

  input[type='checkbox'] {
    flex: none;
    width: 15px;
    height: 15px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    flex: none;
    margin-left: auto;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .link {
    width: 100%;
    text-align: left;
    border: 0;
    background: none;
    padding: 0.15rem 0;
    color: var(--text);
    display: flex;
    gap: 0.5rem;
  }

  .link:hover {
    color: var(--accent);
  }

  .more {
    margin-top: 0.5rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
  }

  .more:hover {
    color: var(--accent-hover);
  }

  .clear {
    margin-top: 0.5rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .breadcrumb {
    list-style: none;
    margin: 0 0 0.5rem;
    padding: 0;
    font-size: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .breadcrumb li {
    display: inline;
  }

  .breadcrumb li:not(:last-child)::after {
    content: '›';
    margin: 0 0.35rem;
    color: var(--text-muted);
  }

  .breadcrumb button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
  }
`;

/** Facets left, results right. */
export const layoutStyles = css`
  .search-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 1.75rem;
    align-items: start;
  }

  .facets {
    min-width: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .results {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 720px) {
    .search-layout {
      grid-template-columns: 1fr;
    }
  }
`;

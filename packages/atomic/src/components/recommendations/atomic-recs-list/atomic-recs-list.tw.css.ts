import {css} from 'lit';

const styles = css`
  :host {
    display: block;
  }

  /**
   * @prop --atomic-recs-number-of-columns: Number of columns for the recommendation list.
   */
  .list-root {
    grid-template-columns: repeat(
      var(--atomic-recs-number-of-columns, 1),
      minmax(0, 1fr)
    );
  }

  [part='label'] {
    font-family: var(--font-sans);
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
  }

  atomic-recs-result:not(:defined) {
    visibility: hidden;
  }
`;

export default styles;

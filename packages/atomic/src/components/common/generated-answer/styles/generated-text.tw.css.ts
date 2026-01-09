import {css} from 'lit';

const styles = css`
  [part='generated-text'] {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  [part='generated-text'].cursor::after {
    content: '';
    width: 8px;
    height: 1em;
    margin-left: 0.1em;
    background-color: var(--atomic-neutral-dark);
    display: inline-block;
    animation: cursor-blink 1.5s steps(2) infinite;
    vertical-align: text-bottom;
  }
`;

export default styles;

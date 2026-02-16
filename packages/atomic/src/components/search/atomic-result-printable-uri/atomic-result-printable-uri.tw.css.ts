import {css} from 'lit';

const styles = css`
  atomic-result-printable-uri {
    max-width: 100%;
    word-break: break-word;
  }

  atomic-result-printable-uri a,
  atomic-result-printable-uri button {
    color: var(--atomic-primary);
  }

  atomic-result-printable-uri a:hover,
  atomic-result-printable-uri a:focus-visible,
  atomic-result-printable-uri button:hover,
  atomic-result-printable-uri button:focus-visible {
    text-decoration: underline;
    color: var(--atomic-primary);
  }

  atomic-result-printable-uri a:focus,
  atomic-result-printable-uri button:focus {
    outline: none;
  }

  atomic-result-printable-uri a:visited {
    color: var(--atomic-visited);
  }

  atomic-result-printable-uri ul {
    display: flex;
    flex-wrap: wrap;
  }

  atomic-result-printable-uri li {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    white-space: nowrap;
  }

  atomic-result-printable-uri li:last-child {
    white-space: normal;
  }

  atomic-result-printable-uri li:last-child::after {
    content: none;
  }

  atomic-result-printable-uri li a {
    display: inline-block;
    vertical-align: middle;
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  atomic-result-printable-uri li .result-printable-uri-separator {
    display: inline-block;
    margin: 0 0.5rem;
    vertical-align: middle;
    width: 0.75rem;
    height: 0.75rem;
    color: var(--atomic-neutral-dark);
  }
`;

export default styles;

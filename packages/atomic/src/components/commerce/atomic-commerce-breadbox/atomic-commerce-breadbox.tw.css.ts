import {css} from 'lit';

const styles = css`
@reference '../../../utils/tailwind.global.tw.css';

[part="breadcrumb-label"].excluded,
[part="breadcrumb-value"].excluded {
  text-decoration: line-through;
  @apply text-error;
}

/* When excluded, strikethrough line must be continuous, so we must prepend empty character instead of margin */
[part="breadcrumb-value"]::before {
  content: "\00a0";
}`;

export default styles;

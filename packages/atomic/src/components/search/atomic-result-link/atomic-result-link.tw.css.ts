import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  atomic-result-link a {
    @apply link-style;
    text-decoration: none;
  }
`;

export default styles;

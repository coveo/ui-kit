import {css} from 'lit';

const styles = css`
  @reference '../../../utils/tailwind.global.tw.css';

  @layer components {
    atomic-product-link a {
      @apply link-style;
      text-decoration: none;
    }
  }
`;

export default styles;

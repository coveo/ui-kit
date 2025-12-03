import {css} from 'lit';

const styles = css`
@reference '../../../utils/tailwind.global.tw.css';
/**
 * @prop --atomic-rating-icon-outline: Color of the icon's outline.
 */
@layer components {
  atomic-product-rating,
  atomic-result-rating {
    .text-rating-icon-active,
    .text-rating-icon-inactive {
      & svg path {
        @apply stroke-rating-icon-outline;
      }
    }
  }
}
`;

export default styles;

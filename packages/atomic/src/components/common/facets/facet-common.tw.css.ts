import {css} from 'lit';

const styles = css`
@reference '../../../utils/tailwind.global.tw.css';

.value-count {
  @apply text-neutral-dark ml-1.5;

  [part="value-exclude-button"] + & {
    @apply mr-2;
  }
}

:host(.popover-nested) {
  @apply min-w-2xs;

  &::part(label-button) {
    @apply hidden;
  }

  &::part(facet) {
    @apply shadow-lg;
  }

  &::part(values) {
    @apply mt-0 max-h-96 overflow-y-auto;
  }

  &::part(search-wrapper) {
    @apply mb-2;
  }
}`;

export default styles;

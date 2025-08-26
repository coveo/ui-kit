import {css} from 'lit';

const styles = css`
@reference '../../../../utils/tailwind.global.tw.css';
/**
 * @prop --atomic-facet-boxes-per-row: Number of facet values to display per row, when the display is 'box'
 * @prop --atomic-facet-boxes-gap: Gap value for facet values, when the display is 'box'
 */
.box-container {
  @apply grid px-2;
  grid-template-columns: repeat(
      var(--atomic-facet-boxes-per-row, 4),
      minmax(0, 1fr)
    );
  gap: var(--atomic-facet-boxes-gap, 0.5rem);
}

.value-box .value-label,
.value-box-count {
  @apply block w-full;
}

.value-box.selected {
  box-shadow: 0 0 0 1px var(--atomic-primary);
}`;

export default styles;

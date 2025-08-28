import {css} from 'lit';

const styles = css`
@reference '../../../../utils/tailwind.global.tw.css';
/**
 * @prop --atomic-facet-checkbox-size: Size of the checkbox.
 */
.value-checkbox {
  width: var(--atomic-facet-checkbox-size, 1rem);
  height: var(--atomic-facet-checkbox-size, 1rem);

  @apply absolute left-2 z-1;
}

.value-checkbox + label {
  @apply text-on-background hover:bg-neutral-light flex w-full cursor-pointer flex-row truncate py-2.5 pr-2 pl-8;
}

.value-checkbox.selected:focus-visible + label .value-label,
.value-checkbox.selected:hover + label .value-label {
  @apply text-primary;
}

.value-checkbox.excluded:focus-visible + label .value-label,
.value-checkbox.excluded:hover + label .value-label {
  @apply text-error;
}`;

export default styles;

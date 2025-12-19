import {css} from 'lit';

const styles = css`
@reference '../../../../utils/tailwind.global.tw.css';

.value-box {
  @apply relative overflow-hidden;
}

li:first-child .value-box {
  @apply rounded-l;
}

li:last-child .value-box {
  @apply rounded-r;
}

.value-label {
  max-width: 15ch;
}`;

export default styles;

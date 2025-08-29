import {css} from 'lit';

const styles = css`
@reference './mixins.pcss';
.list-wrapper.display-table {
  display: grid;
  overflow-x: auto;
}

.list-root.display-table {
  @apply atomic-result-table;
}
`;

export default styles;

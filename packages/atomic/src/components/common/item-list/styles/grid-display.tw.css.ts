import {css} from 'lit';

const styles = css`
@reference './mixins.pcss';
:host {
  @apply atomic-grid-clickable-elements;
  @apply atomic-grid-display-common;
  @apply atomic-grid-display-desktop;
  @apply atomic-grid-display-mobile;
}
`;

export default styles;

import {css} from 'lit';

const styles = css`
@reference './mixins.pcss';

[part~='divider'] {
  &:not(:last-child) {
    @apply border-b-neutral;
    padding-bottom: 1rem;
  }
  margin-bottom: 1rem;
}

.list-root.display-list {
  display: flex;
  flex-direction: column;

  .result-component,
  atomic-result-placeholder {
    width: auto;
  }

  @media (width >= theme(--breakpoint-desktop)) {
    @apply atomic-list-with-dividers;
  }

  @media not all and (width >= theme(--breakpoint-desktop)) {
    &.image-large {
      @apply atomic-list-with-dividers;
      display: grid;
      justify-content: space-evenly;
      grid-template-columns: minmax(auto, 35rem);
    }

    &.image-small,
    &.image-icon,
    &.image-none {
      grid-row-gap: 1rem;

      @apply atomic-list-with-cards;
    }
  }
}
`;

export default styles;

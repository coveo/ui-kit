import {css} from 'lit';

const styles = css`
@import "../../common/template-system/template-system.pcss";

:host {
  @apply atomic-template-system;
  @apply relative;

  .with-sections {
    &.image-icon {
      atomic-product-image::part(previous-button),
      atomic-product-image::part(next-button),
      atomic-product-image::part(indicator) {
        display: none;
      }
    }

    &.display-grid {
      &.image-large,
      &.image-small,
      &.image-icon,
      &.image-none {
        atomic-product-section-name {
          min-height: calc(var(--line-height) * 2);
          @apply line-clamp-2;
        }
      }

      &.density-comfortable {
        &.image-icon,
        &.image-none,
        &.image-small,
        &.image-large {
          & atomic-product-section-description {
            margin-top: 1.25rem;
          }
        }
      }

      &.density-normal {
        &.image-icon,
        &.image-none,
        &.image-small,
        &.image-large {
          & atomic-product-section-description {
            margin-top: 0.75rem;
          }
        }
      }

      &.density-compact {
        &.image-icon,
        &.image-none,
        &.image-small,
        &.image-large {
          & atomic-product-section-description {
            margin-top: 0.25rem;
          }
        }
      }
    }
  }
}
`;

export default styles;

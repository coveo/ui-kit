import {css} from 'lit';

const styles = css`
@import "../../common/template-system/template-system.css";

:host {
  @apply atomic-template-system;
  @apply relative;

  .result-root.display-grid {
    grid-template-areas:
      "badges"
      "visual"
      "title"
      "title-metadata"
      "emphasized"
      "excerpt"
      "bottom-metadata"
      "actions"
      "children";
  }

  .with-sections {
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
      
      @media (width >= theme(--breakpoint-desktop)) {
        &.image-large atomic-product-section-children .product-child {
          @apply aspect-square-[auto];
          width: 16.65%;
        }

        &.image-small atomic-product-section-children .product-child {
          @apply aspect-square-[auto];
          width: 16.65%;
        }

        &.image-icon atomic-product-section-children .product-child,
        &.image-none atomic-product-section-children .product-child {
          width: 2rem;
          height: 2rem;
        }
      }

      @media not all and (width >= theme(--breakpoint-desktop)) {
        &.image-large atomic-product-section-children .product-child {
          @apply aspect-square-[auto];
          width: 16.65%;
        }

        &.image-small atomic-product-section-children .product-child {
          @apply aspect-square-[auto];
          width: 16.65%;
          max-width: 4.75rem;
        }

        &.image-icon atomic-product-section-children .product-child,
        &.image-none atomic-product-section-children .product-child {
          width: 2rem;
          height: 2rem;
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
        @media (width >= theme(--breakpoint-desktop)) {
          &.image-large atomic-product-section-children .product-child {
            @apply aspect-square-[auto];
            width: 16.65%;
          }

          &.image-small atomic-product-section-children .product-child {
            @apply aspect-square-[auto];
            width: 16.65%;
          }

          &.image-icon atomic-product-section-children .product-child,
          &.image-none atomic-product-section-children .product-child {
            width: 2rem;
            height: 2rem;
          }
        }

        @media not all and (width >= theme(--breakpoint-desktop)) {
          &.image-large atomic-product-section-children .product-child {
            @apply aspect-square-[auto];
            width: 16.65%;
          }

          &.image-small atomic-product-section-children .product-child {
            @apply aspect-square-[auto];
            width: 16.65%;
            max-width: 4.75rem;
          }

          &.image-icon atomic-product-section-children .product-child,
          &.image-none atomic-product-section-children .product-child {
            width: 2rem;
            height: 2rem;
          }
        }
      }
    }
  }
}
`;

export default styles;

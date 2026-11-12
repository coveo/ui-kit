import type {Product, ProductVariant} from '@coveo/thermidor-schema';
import styles from './ProductVariants.module.css';

/** How many variant thumbnails a product shows; the others are counted. */
export const VISIBLE_VARIANTS = 5;

/** The thumbnail of a variant without an image, or whose image is not a web or data image URL. */
export const FALLBACK_THUMBNAIL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="gray"%3E%3C/rect%3E%3C/svg%3E';

function thumbnailOf(variant: ProductVariant): string {
  const url = variant.ec_thumbnails?.[0];
  return url && /^(https?:|data:image\/)/i.test(url) ? url : FALLBACK_THUMBNAIL;
}

interface ProductVariantsProps {
  /** The product its slot shows, whose `children` list its variants, the producer's product first. */
  product: Product;
  /** Promotes a variant into the slot. */
  onPromote: (variant: ProductVariant) => void;
}

/**
 * The thumbnails of a product's variants, with the one its slot shows marked, and how many more
 * the group holds. Hovering, touching or pressing Enter on a thumbnail promotes its variant. A
 * product without variants shows nothing.
 */
export function ProductVariants({product, onPromote}: ProductVariantsProps) {
  const variants = product.children ?? [];
  const visible = variants.slice(0, VISIBLE_VARIANTS);
  const more = Math.max(product.totalNumberOfChildren ?? 0, variants.length) - visible.length;
  if (visible.length + more < 2) {
    return null;
  }

  return (
    <div className={styles.variants} role="group" aria-label="Variants">
      {visible.map((variant) => {
        const shown = variant.permanentid === product.permanentid;
        return (
          <button
            key={variant.permanentid}
            type="button"
            className={`${styles.variant} ${shown ? styles.shown : ''}`}
            title={variant.ec_name}
            aria-pressed={shown}
            onMouseEnter={() => onPromote(variant)}
            onTouchStart={() => onPromote(variant)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onPromote(variant);
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              onPromote(variant);
            }}
          >
            <img
              className={styles.thumbnail}
              src={thumbnailOf(variant)}
              alt={variant.ec_name}
              loading="lazy"
            />
          </button>
        );
      })}
      {more > 0 && (
        <span
          className={styles.more}
          aria-label={`${more} more ${more === 1 ? 'variant' : 'variants'}`}
        >
          +{more}
        </span>
      )}
    </div>
  );
}

import {useId} from 'react';
import type {Product, ProductChild} from '@coveo/thermidor-schema';
import styles from './ProductChildren.module.css';

/** How many child thumbnails a product shows; the others are counted. */
export const VISIBLE_CHILDREN = 5;

/** The thumbnail of a child without an image, or whose image is not a web or data image URL. */
export const FALLBACK_THUMBNAIL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="gray"%3E%3C/rect%3E%3C/svg%3E';

function thumbnailOf(child: ProductChild): string {
  const url = child.ec_thumbnails?.[0];
  return url && /^(https?:|data:image\/)/i.test(url) ? url : FALLBACK_THUMBNAIL;
}

interface ProductChildrenProps {
  /** The product its slot shows, whose `children` list its group, the producer's product first. */
  product: Product;
  /** Promotes a child into the slot. */
  onPromote: (child: ProductChild) => void;
}

/**
 * The thumbnails of a product's children, with the one its slot shows marked, and how many more
 * `totalNumberOfChildren` counts. Hovering, touching or pressing Enter on a thumbnail promotes its child. A
 * product without children shows nothing.
 */
export function ProductChildren({product, onPromote}: ProductChildrenProps) {
  const labelId = useId();
  const children = product.children ?? [];
  const visible = children.slice(0, VISIBLE_CHILDREN);
  const more = Math.max(product.totalNumberOfChildren ?? 0, children.length) - visible.length;
  if (visible.length + more < 2) {
    return null;
  }

  return (
    <div role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        Available in:
      </span>
      <div className={styles.children}>
        {visible.map((child) => {
          const shown = child.permanentid === product.permanentid;
          return (
            <button
              key={child.permanentid}
              type="button"
              className={`${styles.child} ${shown ? styles.shown : ''}`}
              title={child.ec_name}
              aria-pressed={shown}
              onMouseEnter={() => onPromote(child)}
              onTouchStart={() => onPromote(child)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onPromote(child);
                }
              }}
              onClick={(event) => {
                event.stopPropagation();
                onPromote(child);
              }}
            >
              <img
                className={styles.thumbnail}
                src={thumbnailOf(child)}
                alt={child.ec_name}
                loading="lazy"
              />
            </button>
          );
        })}
        {more > 0 && (
          <span
            className={styles.more}
            aria-label={`${more} more ${more === 1 ? 'product' : 'products'}`}
          >
            +{more}
          </span>
        )}
      </div>
    </div>
  );
}

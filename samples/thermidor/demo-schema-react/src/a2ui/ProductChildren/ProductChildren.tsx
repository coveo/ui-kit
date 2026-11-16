import {useId} from 'react';
import type {Product, ProductChild} from '@coveo/thermidor-schema';
import styles from './ProductChildren.module.css';

/** How many child thumbnails a product shows; the others are counted. */
const VISIBLE_CHILDREN = 5;

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
  /** Hides the thumbnails from assistive technologies, for a slot inside an interactive element. */
  presentational?: boolean;
}

/**
 * The thumbnails of a product's children, with the one its slot shows marked, and how many more
 * `totalNumberOfChildren` counts. Hovering or clicking a thumbnail promotes its child; unlike
 * Atomic, a click does not open the product. A product without children shows nothing.
 */
export function ProductChildren({
  product,
  onPromote,
  presentational = false,
}: ProductChildrenProps) {
  const labelId = useId();
  const children = product.children ?? [];
  if (children.length === 0) {
    return null;
  }
  const visible = children.slice(0, VISIBLE_CHILDREN);
  const more = Math.max(product.totalNumberOfChildren ?? 0, children.length) - visible.length;
  const Thumbnail = presentational ? 'span' : 'button';

  return (
    <div
      role={presentational ? undefined : 'group'}
      aria-labelledby={presentational ? undefined : labelId}
      aria-hidden={presentational || undefined}
    >
      <div className={styles.header}>
        <span id={labelId}>Available in:</span>
        {more > 0 && (
          <span className={styles.more}>
            <span aria-hidden="true">+{more}</span>
            <span className={styles.visuallyHidden}>
              {more} more {more === 1 ? 'product' : 'products'}
            </span>
          </span>
        )}
      </div>
      <div className={styles.children}>
        {visible.map((child) => {
          const shown = child.permanentid === product.permanentid;
          const name = child.ec_name ?? child.permanentid;
          return (
            <Thumbnail
              key={child.permanentid}
              {...(presentational ? {} : {type: 'button' as const, 'aria-pressed': shown})}
              className={`${styles.child} ${shown ? styles.shown : ''}`}
              title={name}
              onMouseEnter={() => onPromote(child)}
              onClick={(event) => {
                event.stopPropagation();
                onPromote(child);
              }}
            >
              <img
                className={styles.thumbnail}
                src={thumbnailOf(child)}
                alt={name}
                loading="lazy"
              />
            </Thumbnail>
          );
        })}
      </div>
    </div>
  );
}

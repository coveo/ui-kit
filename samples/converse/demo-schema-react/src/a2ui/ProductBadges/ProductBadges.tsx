import type {BadgePlacement} from '@coveo/thermidor-schema';
import styles from './ProductBadges.module.css';

/**
 * The merchandising badges a product earned, across all of its badge placements, in placement
 * then badge order. Colors come from the badge configuration; a badge without them falls back to
 * the sample's neutral badge style. Renders nothing when the product has no badges.
 */
export function ProductBadges({placements}: {placements?: BadgePlacement[]}) {
  const badges = (placements ?? []).flatMap((placement) =>
    placement.badges.map((badge, index) => ({key: `${placement.placementId}-${index}`, badge}))
  );

  if (badges.length === 0) {
    return null;
  }

  return (
    <ul className={styles.badges} aria-label="Product badges">
      {badges.map(({key, badge}) => (
        <li
          key={key}
          className={styles.badge}
          style={{backgroundColor: badge.backgroundColor, color: badge.textColor}}
        >
          {badge.iconUrl && <img className={styles.icon} src={badge.iconUrl} alt="" />}
          {badge.text}
        </li>
      ))}
    </ul>
  );
}

'use client';

import {useEffect} from 'react';
import {useProductEnrichment} from '@/lib/commerce-engine';

export default function ProductBadges() {
  const {state, methods} = useProductEnrichment();

  useEffect(() => {
    if (methods === undefined) return;
    methods?.getBadges();
  }, [methods]);

  const allBadges = state.products.flatMap((product) =>
    product.badgePlacements.flatMap((placement) =>
      placement.badges.map((badge, index) => ({
        key: `${product.productId}-${placement.placementId}-${index}`,
        badge,
      }))
    )
  );

  return allBadges.map(({key, badge}) => (
    <div
      style={{
        backgroundColor: badge.backgroundColor,
        color: badge.textColor,
        display: 'flex',
        gap: '4px',
        width: 'fit-content',
        padding: '4px 8px',
        borderRadius: '4px',
        alignItems: 'center',
        marginBottom: '4px',
      }}
      key={key}
    >
      {badge.iconUrl && <img src={badge.iconUrl} alt="" />}
      <span>{badge.text}</span>
    </div>
  ));
}

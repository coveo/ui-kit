import type React from 'react';
import type {FacetManagerProps} from '@coveo/thermidor-schema';
import {readChildIds} from '../read-child-ids.js';
import styles from './FacetManager.module.css';

export function FacetManagerRenderer({
  props,
  children,
}: {
  props: FacetManagerProps;
  children: (id: string) => React.ReactNode;
}) {
  const childIds = readChildIds(props);

  return (
    <div className={styles.container} data-testid={props.componentId}>
      {childIds.map((childId) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </div>
  );
}

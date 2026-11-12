'use client';

import {useHydration, useResultList} from '@/lib/react/engine';
import HydrationMetadataCommon from '../common/hydration-metadata';

export function HydrationMetadata() {
  const {status} = useHydration();
  const {state} = useResultList();

  return (
    <HydrationMetadataCommon hydrated={status === 'hydrated'} resultCount={state.results.length} />
  );
}

export function HydrationIndicator() {
  const {status} = useHydration();

  return <HydrationMetadataCommon hydrated={status === 'hydrated'} />;
}

'use client';

import {useSyncUrl} from '@/hooks/use-sync-url';
import {useParameterManager} from '@/lib/react/engine';

export default function ParameterManager() {
  const {state, methods} = useParameterManager();

  useSyncUrl({parameters: state.parameters, parameterManager: methods});

  return null;
}

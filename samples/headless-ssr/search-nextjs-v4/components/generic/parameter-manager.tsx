'use client';

import type {SearchParameterManager, SearchParameterManagerState} from '@coveo/headless/ssr-next';
import {useSyncUrl} from '@/hooks/use-sync-url';
import {useControllerState} from './use-controller-state';

interface ParameterManagerProps {
  staticState: SearchParameterManagerState;
  controller?: SearchParameterManager;
}

export default function ParameterManager({staticState, controller}: ParameterManagerProps) {
  const state = useControllerState(staticState, controller);

  useSyncUrl({parameters: state.parameters, parameterManager: controller});

  return null;
}

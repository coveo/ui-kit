'use client';

import type {Facet as FacetController, FacetState} from '@coveo/headless/ssr-next';
import FacetCommon from '../common/facet';
import {useControllerState} from './use-controller-state';

interface FacetProps {
  title: string;
  staticState: FacetState;
  controller?: FacetController;
}

export default function Facet({title, staticState, controller}: FacetProps) {
  const state = useControllerState(staticState, controller);

  return <FacetCommon title={title} state={state} methods={controller} />;
}

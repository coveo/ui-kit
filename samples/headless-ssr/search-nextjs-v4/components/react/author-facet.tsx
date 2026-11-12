'use client';

import {useAuthorFacet} from '@/lib/react/engine';
import FacetCommon from '../common/facet';

export default function AuthorFacet() {
  const {state, methods} = useAuthorFacet();

  return <FacetCommon title="Author" state={state} methods={methods} />;
}

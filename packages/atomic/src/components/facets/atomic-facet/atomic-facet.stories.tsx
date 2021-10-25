import {h} from '@stencil/core';
import FacetDoc from './atomic-facet.mdx';

export default {
  title: 'Atomic/Facet',
  parameters: {
    docs: {
      page: FacetDoc,
    },
  },
};

export const TheDefaultFacet = () => {
  return <div>This is where we need to define the story for a facet</div>;
};

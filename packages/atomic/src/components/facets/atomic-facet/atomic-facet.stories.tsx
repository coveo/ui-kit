import {h} from '@stencil/core';
import FacetDoc from './atomic-facet.mdx';
import {Args} from '@storybook/api';
import {mapPropsToArgTypes} from '../../../../.storybook/map-props-to-args';

export default {
  title: 'Atomic/Facet',
  argTypes: mapPropsToArgTypes('atomic-facet'),
  parameters: {
    docs: {
      page: FacetDoc,
    },
  },
};

export const TheDefaultFacet = (args: Args) => {
  return (
    <div>
      <div>This is where we need to define the story for a facet</div>
      <code>Current args: {JSON.stringify(args)}</code>
    </div>
  );
};

import {Args} from '@storybook/api';
import {mapPropsToArgTypes} from '../../../.storybook/map-props-to-args';

export default {
  title: 'Atomic/SearchInterface',
  argTypes: mapPropsToArgTypes('atomic-search-interface'),
};

export const DefaultSearchInterface = (args: Args) => {
  return `<atomic-search-interface></atomic-search-interface>`;
};

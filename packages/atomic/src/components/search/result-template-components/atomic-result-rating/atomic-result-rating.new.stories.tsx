import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResult} from '@/storybook-utils/search/result-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-rating',
  {excludeCategories: ['methods']}
);

const {decorator: resultDecorator, engineConfig} = wrapInResult({
  preprocessRequest: (r) => {
    const parsed = JSON.parse(r.body as string);
    parsed.aq = '@snrating';
    parsed.fieldsToInclude = [...parsed.fieldsToInclude, 'snrating'];
    parsed.numberOfResults = 1;
    r.body = JSON.stringify(parsed);
    return r;
  },
});
const {decorator: searchInterfaceDecorator, play} =
  wrapInSearchInterface(engineConfig);

const meta: Meta = {
  component: 'atomic-result-rating',
  title: 'Atomic/ResultList/ResultRating',
  id: 'atomic-result-rating',
  render: (args) => template(args),
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-rating',
  args: {field: 'snrating'},
};

#!/usr/bin/env node

/**
 * Generate Storybook story template for Atomic components or sample pages.
 *
 * Usage:
 *   node scripts/generate-story-template.mjs <component-name> [--type component|page] [--category search|commerce|insight]
 *
 * Examples:
 *   node scripts/generate-story-template.mjs atomic-my-component
 *   node scripts/generate-story-template.mjs my-page --type page --category commerce
 */

import {readFileSync} from 'fs';
import {resolve} from 'path';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Generate Storybook story template for Atomic components or sample pages.

Usage:
  node scripts/generate-story-template.mjs <name> [options]

Options:
  --type       Type of story: component (default) or page
  --category   Category: search (default), commerce, insight, ipx, recommendations
  --result     For result template components (adds result wrappers)

Examples:
  node scripts/generate-story-template.mjs atomic-my-component
  node scripts/generate-story-template.mjs my-page --type page --category commerce
  node scripts/generate-story-template.mjs atomic-result-field --result
  `);
  process.exit(0);
}

const name = args[0];
const type = args.includes('--type')
  ? args[args.indexOf('--type') + 1]
  : 'component';
const category = args.includes('--category')
  ? args[args.indexOf('--category') + 1]
  : 'search';
const isResult = args.includes('--result');

function generateComponentStory(componentName, cat, isResultComponent) {
  const apiMock = cat === 'commerce' ? 'MockCommerceApi' : 'MockSearchApi';
  const apiPath = cat === 'commerce' ? 'commerce' : 'search';
  const wrapper =
    cat === 'commerce'
      ? 'wrapInCommerceInterface'
      : 'wrapInSearchInterface';
  const wrapperPath =
    cat === 'commerce'
      ? '@/storybook-utils/commerce/commerce-interface-wrapper'
      : '@/storybook-utils/search/search-interface-wrapper';

  const resultWrappers = isResultComponent
    ? `
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';

const customResultListDecorator: Decorator = (story) => html\`
  <atomic-result-list
    display="list"
    number-of-placeholders="1"
    density="compact"
    image-size="small"
  >
    \${story()}
  </atomic-result-list>
\`;

const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);`
    : '';

  const resultDecorators = isResultComponent
    ? `resultTemplateDecorator,
    customResultListDecorator,
    `
    : '';

  const resultConfig = isResultComponent
    ? `
${apiPath}ApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = ${wrapper}({
  skipFirstSearch: false,
  includeCodeRoot: false,
});`
    : `const {decorator, play} = ${wrapper}();`;

  const decoratorVar = isResultComponent ? 'searchInterfaceDecorator' : 'decorator';

  return `import type {${isResultComponent ? 'Decorator, ' : ''}Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';${isResultComponent ? "\nimport {html} from 'lit';" : ''}
import {${apiMock}} from '@/storybook-utils/api/${apiPath}/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {${wrapper}} from '${wrapperPath}';${resultWrappers}

const ${apiPath}ApiHarness = new ${apiMock}();

${resultConfig}

const {events, args, argTypes, template} = getStorybookHelpers(
  '${componentName}',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: '${componentName}',
  title: '${capitalize(cat)}/${toTitleCase(componentName.replace('atomic-', '').replace(/-/g, ' '))}',
  id: '${componentName}',
  render: (args) => template(args),
  decorators: [${resultDecorators}${decoratorVar}],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...${apiPath}ApiHarness.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    ${apiPath}ApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};

export const CustomVariant: Story = {
  name: 'Custom Variant',
  args: {
    // Add custom args here
  },
};
`;
}

function generatePageStory(pageName, cat) {
  const apiMock = cat === 'commerce' ? 'MockCommerceApi' : 'MockSearchApi';
  const apiPath = cat === 'commerce' ? 'commerce' : 'search';
  const interfaceType = cat === 'commerce' ? 'commerce' : 'search';
  const interfaceTag =
    cat === 'commerce'
      ? 'atomic-commerce-interface'
      : 'atomic-search-interface';
  const engineConfig =
    cat === 'commerce'
      ? 'getSampleCommerceEngineConfiguration'
      : 'getSampleSearchEngineConfiguration';
  const headlessPath = cat === 'commerce' ? '@coveo/headless/commerce' : '@coveo/headless';
  const executeMethod =
    cat === 'commerce' ? 'executeFirstRequest' : 'executeFirstSearch';

  return `import {${engineConfig}} from '${headlessPath}';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {${apiMock}} from '@/storybook-utils/api/${apiPath}/mock';
import {
  type baseResponse,
  richResponse,
} from '@/storybook-utils/api/${apiPath}/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters.js';

async function initialize${capitalize(interfaceType)}Interface(canvasElement: HTMLElement) {
  await customElements.whenDefined('${interfaceTag}');
  const ${interfaceType}Interface = canvasElement.querySelector(
    '${interfaceTag}'
  );
  await ${interfaceType}Interface!.initialize(${engineConfig}());
}

const mock${capitalize(apiPath)}Api = new ${apiMock}();

const meta: Meta = {
  component: '${pageName}',
  title: '${capitalize(cat)}/Example Pages',
  id: '${pageName}',
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    msw: {
      handlers: [...mock${capitalize(apiPath)}Api.handlers],
    },
    chromatic: {disableSnapshot: false},
  },
  beforeEach: async () => {
    mock${capitalize(apiPath)}Api.searchEndpoint.mock(
      () => richResponse as unknown as typeof baseResponse
    );
  },
  render: () => html\`
    <${interfaceTag} language-assets-path="./lang" icon-assets-path="./assets"${cat === 'commerce' ? ' type="search"' : ''}>
      <!-- Add your component markup here -->
    </${interfaceTag}>
  \`,
  play: async (context) => {
    await initialize${capitalize(interfaceType)}Interface(context.canvasElement);
    const ${interfaceType}Interface = context.canvasElement.querySelector(
      '${interfaceTag}'
    );
    await ${interfaceType}Interface!.${executeMethod}();
  },
};

export default meta;

export const Default: Story = {
  name: '${toTitleCase(pageName.replace(/-/g, ' '))}',
};
`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

// Generate the appropriate template
if (type === 'page') {
  console.log(generatePageStory(name, category));
} else {
  console.log(generateComponentStory(name, category, isResult));
}

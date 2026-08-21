import type {SearchBox} from '@coveo/headless';
import {MockSearchApi} from '@coveo/platform-mock-api/search';
import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {dispatchSearchBoxSuggestionsEvent} from '@/src/components/common/suggestions/suggestions-events.js';
import type {SearchBoxSuggestionsBindings} from '@/src/components/common/suggestions/suggestions-types.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js';

const CUSTOM_SUGGESTIONS_TAG = 'custom-suggestions-story-example';

const availableSuggestions = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];

type Bindings = SearchBoxSuggestionsBindings<SearchBox>;

/**
 * Minimal custom suggestion provider, mirroring what a consumer writes: a plain
 * custom element that registers itself with the surrounding search box through
 * `dispatchSearchBoxSuggestionsEvent` and then owns its own items.
 *
 * The dev example this replaces resolved suggestions from a public HTTP API. They
 * come from a local list here so the story stays deterministic.
 */
class CustomSuggestions extends HTMLElement {
  private suggestions: string[] = [];

  private renderSuggestions(bindings: Bindings) {
    return this.suggestions.map((suggestion) => {
      const content = document.createElement('div');
      content.innerText = suggestion;

      return {
        key: suggestion,
        query: suggestion,
        onSelect: () => {
          bindings.searchBoxController.updateText(suggestion);
          bindings.searchBoxController.submit();
        },
        content,
      };
    });
  }

  private resolveSuggestions(bindings: Bindings) {
    const query = bindings.searchBoxController.state.value;
    this.suggestions = query
      ? availableSuggestions.filter((suggestion) => suggestion.includes(query[0]))
      : availableSuggestions.slice(0, 2);

    return Promise.resolve();
  }

  connectedCallback() {
    dispatchSearchBoxSuggestionsEvent<SearchBox>(
      (bindings) => ({
        position: 0,
        onInput: () => this.resolveSuggestions(bindings),
        renderItems: () => this.renderSuggestions(bindings),
      }),
      this
    );
  }
}

if (!customElements.get(CUSTOM_SUGGESTIONS_TAG)) {
  customElements.define(CUSTOM_SUGGESTIONS_TAG, CustomSuggestions);
}

const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const searchApiHarness = new MockSearchApi();

const normalWidthDecorator: Decorator = (story) => html`
  <div style="min-width: 600px;" id="code-root">${story()}</div>
`;

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Search Box/Custom Suggestions',
  id: 'atomic-search-box-custom-suggestions',
  render: () => html`
    <atomic-search-box suggestion-timeout="1000">
      <custom-suggestions-story-example></custom-suggestions-story-example>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
    </atomic-search-box>
  `,
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  beforeEach: () => {
    searchApiHarness.querySuggestEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {};

export const WithSuggestionsOpen: Story = {
  name: 'With the suggestions list open',
  play: async (context) => {
    await play(context);
    const searchInput = await context.canvas.findByShadowPlaceholderText('Search');
    await userEvent.click(searchInput);
  },
};

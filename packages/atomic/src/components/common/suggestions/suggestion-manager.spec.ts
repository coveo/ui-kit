import type {LitElement} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {SuggestionManager} from './suggestion-manager';
import type {SearchBoxSuggestionElement} from './suggestions-types';

describe('SuggestionManager', () => {
  const buildManager = () => {
    const logger = {warn: vi.fn()};
    const manager = new SuggestionManager<unknown>({
      getSearchBoxValue: () => '',
      updateQuery: vi.fn(),
      getSuggestionTimeout: () => 1000,
      getNumberOfSuggestionsToDisplay: () => 10,
      getSuggestionDelay: () => 0,
      getLogger: () => logger,
      getHost: () => ({requestUpdate: vi.fn()}) as unknown as LitElement,
    });
    return {manager, logger};
  };

  const registerItems = (
    manager: SuggestionManager<unknown>,
    items: SearchBoxSuggestionElement[]
  ) => {
    manager.registerSuggestions({position: 0, renderItems: () => items});
  };

  const stencilVNode = {
    $tag$: 'span',
    $children$: null,
  } as unknown as SearchBoxSuggestionElement['content'];

  describe('when the suggestions are triggered', () => {
    it('should log one deprecation warning when a suggestion has Stencil VNode content', async () => {
      const {manager, logger} = buildManager();
      registerItems(manager, [{key: 'vnode', content: stencilVNode}]);

      await manager.triggerSuggestions();
      await manager.triggerSuggestions();

      expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
        '[Deprecated] Stencil `VNode` content in search box suggestions is deprecated and will be removed in Atomic v4. Use an `Element` as the `content` of each suggestion instead.'
      );
    });

    it('should not log a deprecation warning when every suggestion has Element content', async () => {
      const {manager, logger} = buildManager();
      registerItems(manager, [{key: 'element', content: document.createElement('span')}]);

      await manager.triggerSuggestions();

      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});

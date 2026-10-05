import type {LitElement} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {SuggestionManager} from './suggestion-manager';
import type {
  SearchBoxSuggestionAction,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
} from './suggestions-types';

describe('suggestion-manager', () => {
  const buildManager = (numberOfSuggestionsToDisplay = 5) =>
    new SuggestionManager({
      getSearchBoxValue: () => '',
      updateQuery: vi.fn(),
      getSuggestionTimeout: () => 100,
      getNumberOfSuggestionsToDisplay: () => numberOfSuggestionsToDisplay,
      getSuggestionDelay: () => 0,
      getLogger: () => ({warn: vi.fn()}),
      getHost: () => ({requestUpdate: vi.fn()}) as unknown as LitElement,
    });

  const buildElement = (query: string): SearchBoxSuggestionElement => ({
    key: query,
    content: document.createElement('div'),
    query,
  });

  const buildAction = (label: string): SearchBoxSuggestionAction => ({
    label,
    onSelect: vi.fn(),
  });

  const buildSuggestions = (
    position: number,
    queries: string[],
    actions?: SearchBoxSuggestionAction[]
  ): SearchBoxSuggestions => ({
    position,
    renderItems: () => queries.map(buildElement),
    ...(actions && {renderActions: () => actions}),
  });

  describe('#triggerSuggestions', () => {
    it('should set the actions of the suggestions that have displayed elements', async () => {
      const manager = buildManager();
      const action = buildAction('action');
      manager.registerSuggestions(buildSuggestions(0, ['query'], [action]));

      await manager.triggerSuggestions();

      expect(manager.suggestionActions).toEqual([action]);
    });

    it('should not set the actions of the suggestions that have no elements', async () => {
      const manager = buildManager();
      manager.registerSuggestions(buildSuggestions(0, ['query']));
      manager.registerSuggestions(buildSuggestions(1, [], [buildAction('action')]));

      await manager.triggerSuggestions();

      expect(manager.suggestionActions).toEqual([]);
    });

    it('should not set the actions of the suggestions whose elements exceed the number of suggestions to display', async () => {
      const manager = buildManager(1);
      manager.registerSuggestions(buildSuggestions(0, ['first']));
      manager.registerSuggestions(buildSuggestions(1, ['second'], [buildAction('action')]));

      await manager.triggerSuggestions();

      expect(manager.suggestionActions).toEqual([]);
    });

    it('should order the actions by suggestion position', async () => {
      const manager = buildManager();
      const firstAction = buildAction('first');
      const secondAction = buildAction('second');
      manager.registerSuggestions(buildSuggestions(1, ['second'], [secondAction]));
      manager.registerSuggestions(buildSuggestions(0, ['first'], [firstAction]));

      await manager.triggerSuggestions();

      expect(manager.suggestionActions).toEqual([firstAction, secondAction]);
    });
  });

  describe('#clearSuggestions', () => {
    it('should remove the actions', async () => {
      const manager = buildManager();
      manager.registerSuggestions(buildSuggestions(0, ['query'], [buildAction('action')]));
      await manager.triggerSuggestions();

      manager.clearSuggestions();

      expect(manager.suggestionActions).toEqual([]);
    });
  });
});

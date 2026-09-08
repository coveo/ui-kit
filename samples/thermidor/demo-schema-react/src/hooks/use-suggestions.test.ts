import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useSuggestions} from './use-suggestions.js';

describe('useSuggestions', () => {
  describe('context=landing', () => {
    it('returns exactly 2 sections', () => {
      const {result} = renderHook(() => useSuggestions({inputValue: '', context: 'landing'}));
      expect(result.current.sections).toHaveLength(2);
    });

    it('returns a first section with id "search", title "Search", and icon "search"', () => {
      const {result} = renderHook(() => useSuggestions({inputValue: '', context: 'landing'}));
      const first = result.current.sections[0];
      expect(first.id).toBe('search');
      expect(first.title).toBe('Search');
      expect(first.icon).toBe('search');
    });

    it('returns a second section with id "conversational", title "Conversational", and icon "sparkle"', () => {
      const {result} = renderHook(() => useSuggestions({inputValue: '', context: 'landing'}));
      const second = result.current.sections[1];
      expect(second.id).toBe('conversational');
      expect(second.title).toBe('Conversational');
      expect(second.icon).toBe('sparkle');
    });
  });

  describe('context=search-results', () => {
    it('returns exactly 3 sections', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: '', context: 'search-results'})
      );
      expect(result.current.sections).toHaveLength(3);
    });

    it('returns a first section with id "refinements", title "Search refinements", and icon "settings"', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: '', context: 'search-results'})
      );
      const first = result.current.sections[0];
      expect(first.id).toBe('refinements');
      expect(first.title).toBe('Search refinements');
      expect(first.icon).toBe('settings');
    });

    it('returns a second section with id "search"', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: '', context: 'search-results'})
      );
      expect(result.current.sections[1].id).toBe('search');
    });

    it('returns a third section with id "conversational"', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: '', context: 'search-results'})
      );
      expect(result.current.sections[2].id).toBe('conversational');
    });
  });

  describe('isLoading', () => {
    it('returns isLoading as false for landing context', () => {
      const {result} = renderHook(() => useSuggestions({inputValue: '', context: 'landing'}));
      expect(result.current.isLoading).toBe(false);
    });

    it('returns isLoading as false for search-results context', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: '', context: 'search-results'})
      );
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('inputValue', () => {
    it('accepts inputValue without error', () => {
      const {result} = renderHook(() =>
        useSuggestions({inputValue: 'some query', context: 'landing'})
      );
      expect(result.current.sections).toHaveLength(2);
    });
  });
});

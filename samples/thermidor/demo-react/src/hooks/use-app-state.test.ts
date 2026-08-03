import {describe, it, expect} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {appReducer, useAppState} from './use-app-state.js';
import type {AppState, AppAction} from './use-app-state.js';

describe('appReducer', () => {
  it('starts with landing view', () => {
    const initial: AppState = {view: 'landing'};
    const result = appReducer(initial, {type: 'NAVIGATE_LANDING'});
    expect(result.view).toBe('landing');
  });

  it('transitions to search on NAVIGATE_SEARCH', () => {
    const state: AppState = {view: 'landing'};
    const result = appReducer(state, {type: 'NAVIGATE_SEARCH'});
    expect(result.view).toBe('search');
  });

  it('transitions to conversation on NAVIGATE_CONVERSATION', () => {
    const state: AppState = {view: 'landing'};
    const result = appReducer(state, {type: 'NAVIGATE_CONVERSATION'});
    expect(result.view).toBe('conversation');
  });

  it('transitions to landing on NAVIGATE_LANDING', () => {
    const state: AppState = {view: 'conversation'};
    const result = appReducer(state, {type: 'NAVIGATE_LANDING'});
    expect(result.view).toBe('landing');
  });

  it('returns current state for unknown actions', () => {
    const state: AppState = {view: 'search'};
    const result = appReducer(state, {type: 'UNKNOWN'} as unknown as AppAction);
    expect(result).toBe(state);
  });
});

describe('useAppState', () => {
  it('initializes with landing view', () => {
    const {result} = renderHook(() => useAppState());
    expect(result.current.view).toBe('landing');
  });

  it('dispatches NAVIGATE_SEARCH correctly', () => {
    const {result} = renderHook(() => useAppState());

    act(() => {
      result.current.dispatch({type: 'NAVIGATE_SEARCH'});
    });

    expect(result.current.view).toBe('search');
  });

  it('dispatches NAVIGATE_CONVERSATION correctly', () => {
    const {result} = renderHook(() => useAppState());

    act(() => {
      result.current.dispatch({type: 'NAVIGATE_CONVERSATION'});
    });

    expect(result.current.view).toBe('conversation');
  });

  it('dispatches NAVIGATE_LANDING correctly', () => {
    const {result} = renderHook(() => useAppState());

    act(() => {
      result.current.dispatch({type: 'NAVIGATE_CONVERSATION'});
    });

    act(() => {
      result.current.dispatch({type: 'NAVIGATE_LANDING'});
    });

    expect(result.current.view).toBe('landing');
  });
});

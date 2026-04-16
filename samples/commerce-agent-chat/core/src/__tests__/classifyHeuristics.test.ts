import {describe, expect, it} from 'vitest';

import {classifyQueryLocally} from '../lib/classifyHeuristics.js';

describe('classifyQueryLocally', () => {
  it('returns "search" for empty string', () => {
    expect(classifyQueryLocally('')).toBe('search');
  });

  it('returns "search" for whitespace-only string', () => {
    expect(classifyQueryLocally('   ')).toBe('search');
  });

  it('returns "search" for short keyword query', () => {
    expect(classifyQueryLocally('red shoes')).toBe('search');
  });

  it('returns "search" for single-word query', () => {
    expect(classifyQueryLocally('laptop')).toBe('search');
  });

  it('returns "search" for 4-word keyword query', () => {
    expect(classifyQueryLocally('blue running shoes sale')).toBe('search');
  });

  it('returns "agent" for question ending with ?', () => {
    expect(classifyQueryLocally('what is the best laptop?')).toBe('agent');
  });

  it('returns "agent" for short question ending with ?', () => {
    expect(classifyQueryLocally('shoes?')).toBe('agent');
  });

  it('returns "agent" for "help" prefix', () => {
    expect(classifyQueryLocally('help me find a gift')).toBe('agent');
  });

  it('returns "agent" for "explain" prefix', () => {
    expect(classifyQueryLocally('explain the difference between models')).toBe(
      'agent'
    );
  });

  it('returns "agent" for "compare" prefix', () => {
    expect(classifyQueryLocally('compare these two products')).toBe('agent');
  });

  it('returns "agent" for "recommend" prefix', () => {
    expect(classifyQueryLocally('recommend a good headset')).toBe('agent');
  });

  it('returns "agent" for "suggest" prefix', () => {
    expect(classifyQueryLocally('suggest alternatives to this item')).toBe(
      'agent'
    );
  });

  it('returns "agent" for "find me" prefix', () => {
    expect(classifyQueryLocally('find me a laptop under 500')).toBe('agent');
  });

  it('returns "agent" for "show me" prefix', () => {
    expect(classifyQueryLocally('show me similar products')).toBe('agent');
  });

  it('returns "agent" for "what" prefix', () => {
    expect(classifyQueryLocally('what laptops are available')).toBe('agent');
  });

  it('returns "agent" for "why" prefix', () => {
    expect(classifyQueryLocally('why is this product popular')).toBe('agent');
  });

  it('returns "agent" for "how" prefix', () => {
    expect(classifyQueryLocally('how do I pick the right size')).toBe('agent');
  });

  it('returns "agent" for "which" prefix', () => {
    expect(classifyQueryLocally('which model has longer battery life')).toBe(
      'agent'
    );
  });

  it('returns "agent" for "can you" prefix', () => {
    expect(classifyQueryLocally('can you find a deal on headphones')).toBe(
      'agent'
    );
  });

  it('returns "agent" for "i need" prefix', () => {
    expect(classifyQueryLocally('i need a new monitor')).toBe('agent');
  });

  it('returns "agent" for "i want" prefix', () => {
    expect(classifyQueryLocally('i want something lightweight')).toBe('agent');
  });

  it('returns "agent" for "looking for" prefix', () => {
    expect(classifyQueryLocally('looking for wireless earbuds')).toBe('agent');
  });

  it('returns "agent" for long free-form text (>4 words)', () => {
    expect(
      classifyQueryLocally(
        'I have a budget of 500 dollars and need a new laptop for school'
      )
    ).toBe('agent');
  });

  it('is case-insensitive for prefix matching', () => {
    expect(classifyQueryLocally('HELP me find shoes')).toBe('agent');
    expect(classifyQueryLocally('Recommend a phone')).toBe('agent');
  });
});

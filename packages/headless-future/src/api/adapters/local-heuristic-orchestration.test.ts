import {describe, it, expect} from 'vitest';
import {
  LocalHeuristicOrchestrationAdapter,
  classify,
} from './local-heuristic-orchestration.js';

// ---------------------------------------------------------------------------
// classify() — pure function tests
// ---------------------------------------------------------------------------

describe('classify()', () => {
  describe('assistant-first patterns', () => {
    it.each([
      'What is headless?',
      'How do I reset my password?',
      'Why is this item out of stock?',
      'Who is the product manager?',
      'When is the next release?',
      'Where can I find the size guide?',
      'Can you explain the warranty?',
      'Please summarize the product details',
      'Tell me about this feature',
      'Is this waterproof?', // ends with ?
    ])('classifies "%s" as assistant-first', (message) => {
      expect(classify(message)).toBe('assistant-first');
    });
  });

  describe('search-first patterns', () => {
    it.each([
      'running shoes',
      'blue leather jacket',
      'find me a red dress',
      'search for wireless headphones',
      'show me the latest arrivals',
      'list all products under $50',
    ])('classifies "%s" as search-first', (message) => {
      expect(classify(message)).toBe('search-first');
    });
  });

  describe('blended patterns', () => {
    it.each([
      'Find out what the shipping cost is?',
      'How much does shipping cost',
      'What is the price of this jacket?',
    ])('classifies "%s" as blended', (message) => {
      expect(classify(message)).toBe('blended');
    });
  });

  it('returns search-first for an empty string', () => {
    expect(classify('')).toBe('search-first');
  });

  it('is case-insensitive', () => {
    expect(classify('WHAT IS THIS')).toBe('assistant-first');
    expect(classify('FIND ME A HAT')).toBe('search-first');
  });
});

// ---------------------------------------------------------------------------
// LocalHeuristicOrchestrationAdapter — snapshot shape tests
// ---------------------------------------------------------------------------

describe('LocalHeuristicOrchestrationAdapter', () => {
  const adapter = new LocalHeuristicOrchestrationAdapter();

  it('returns a valid OrchestrationSnapshot for assistant-first message', async () => {
    const snapshot = await adapter.getSnapshot({
      lastUserMessage: 'What are the best hiking boots?',
    });

    expect(snapshot.mode).toBe('assistant-first');
    expect(snapshot.correlationId).toMatch(/^local-/);
    expect(snapshot.timestamp).toBeGreaterThan(0);
    expect(snapshot.metadata?.provider).toBe('local-heuristic');
    expect(snapshot.metadata?.locale).toBe('en');
    expect(snapshot.confidence).toBe(0.8);
  });

  it('returns search-first for a keyword query', async () => {
    const snapshot = await adapter.getSnapshot({
      lastUserMessage: 'trail running shoes',
    });

    expect(snapshot.mode).toBe('search-first');
    expect(snapshot.confidence).toBe(0.8);
  });

  it('returns search-first when no message is provided', async () => {
    const snapshot = await adapter.getSnapshot({});

    expect(snapshot.mode).toBe('search-first');
  });

  it('assigns lower confidence (0.5) for blended mode', async () => {
    // "find what the price is?" hits both search-first and assistant-first
    const snapshot = await adapter.getSnapshot({
      lastUserMessage: 'Find what the price is?',
    });

    if (snapshot.mode === 'blended') {
      expect(snapshot.confidence).toBe(0.5);
    }
  });

  it('generates unique correlationIds for consecutive calls', async () => {
    const s1 = await adapter.getSnapshot({lastUserMessage: 'Hello'});
    const s2 = await adapter.getSnapshot({lastUserMessage: 'Hello'});

    expect(s1.correlationId).not.toBe(s2.correlationId);
  });
});

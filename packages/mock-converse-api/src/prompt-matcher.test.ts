import {describe, it, expect} from 'vitest';
import {matchPrompt} from './prompt-matcher.js';

describe('matchPrompt', () => {
  it('returns response1 for the surfing kit prompt', () => {
    expect(
      matchPrompt(
        'Build a beginner surfing kit with budget, mid-range, and premium options'
      )
    ).toBe('response1');
  });

  it('returns response2 for the snorkeling prompt', () => {
    expect(matchPrompt('What should I pack for a snorkeling trip?')).toBe(
      'response2'
    );
  });

  it('returns response3 for "kayaks"', () => {
    expect(matchPrompt('kayaks')).toBe('response3');
  });

  it('returns response4 for "wetsuits"', () => {
    expect(matchPrompt('wetsuits')).toBe('response4');
  });

  it('returns response5 (fallback) for unrecognized prompts', () => {
    expect(matchPrompt('something completely different')).toBe('response5');
  });

  it('performs case-insensitive matching', () => {
    expect(matchPrompt('KAYAKS')).toBe('response3');
    expect(matchPrompt('Kayaks')).toBe('response3');
    expect(matchPrompt('WETSUITS')).toBe('response4');
    expect(matchPrompt('WHAT SHOULD I PACK FOR A SNORKELING TRIP?')).toBe(
      'response2'
    );
  });

  it('returns fallback for empty string', () => {
    expect(matchPrompt('')).toBe('response5');
  });
});

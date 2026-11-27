import {afterEach, describe, expect, it} from 'vitest';
import {focusNearestResults} from './results-focus.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('focusNearestResults', () => {
  it("does not reach an earlier turn's results when its own turn has none", () => {
    document.body.innerHTML = `
      <div data-turn-surfaces><p data-results-focus-target tabindex="-1"></p></div>
      <div data-turn-surfaces><div id="control-parent"></div></div>
    `;

    focusNearestResults(document.getElementById('control-parent'));

    expect(document.activeElement).toBe(document.body);
  });

  it('focuses the results of its own turn', () => {
    document.body.innerHTML = `
      <div data-turn-surfaces><p data-results-focus-target tabindex="-1"></p></div>
      <div data-turn-surfaces>
        <div id="control-parent"></div>
        <p id="current" data-results-focus-target tabindex="-1"></p>
      </div>
    `;

    focusNearestResults(document.getElementById('control-parent'));

    expect(document.activeElement).toBe(document.getElementById('current'));
  });
});

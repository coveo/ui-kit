import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HighlightedText} from './HighlightedText.js';

describe('HighlightedText', () => {
  it('bolds the matches and keeps the text whole', () => {
    const {container} = render(<HighlightedText text="Water shoes" query="sho" />);

    expect(container.textContent).toBe('Water shoes');
    expect([...container.querySelectorAll('strong')].map((node) => node.textContent)).toEqual([
      'sho',
    ]);
  });
});

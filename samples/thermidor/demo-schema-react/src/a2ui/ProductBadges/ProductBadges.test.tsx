import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductBadges} from './ProductBadges.js';

describe('ProductBadges', () => {
  it('renders every badge across placements with its configured colors', () => {
    render(
      <ProductBadges
        placements={[
          {
            placementId: 'placement-1',
            badges: [
              {
                text: 'Bestseller!',
                backgroundColor: '#ff0000',
                textColor: '#ffffff',
                iconUrl: 'https://example.com/icon.png',
              },
            ],
          },
          {placementId: 'placement-2', badges: [{text: 'New'}]},
        ]}
      />
    );

    const badges = screen.getAllByRole('listitem');
    expect(badges.map((badge) => badge.textContent)).toEqual(['Bestseller!', 'New']);
    expect(badges[0].style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(badges[0].style.color).toBe('rgb(255, 255, 255)');
    expect(badges[0].querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/icon.png'
    );
    expect(badges[1].style.backgroundColor).toBe('');
    expect(badges[1].querySelector('img')).toBeNull();
  });

  it('renders nothing without badges', () => {
    const {container} = render(
      <ProductBadges placements={[{placementId: 'placement-1', badges: []}]} />
    );

    expect(container.firstChild).toBeNull();
    expect(render(<ProductBadges />).container.firstChild).toBeNull();
  });
});

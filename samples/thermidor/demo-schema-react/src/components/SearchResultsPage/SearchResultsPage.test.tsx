import {render, screen, fireEvent} from '@testing-library/react';
import {beforeEach, describe, it, expect, vi} from 'vitest';
import {SearchResultsPage} from './SearchResultsPage.js';

vi.mock('../../a2ui/surfaces.js', () => ({
  ThermidorA2UISurfaces: ({messages}: {messages: Array<Record<string, any>>}) => (
    <div data-testid="a2ui-surfaces">
      {messages.map((message) => message.createSurface?.surfaceId).join(',')}
    </div>
  ),
}));

// The page reads the renderer-ready v0.9 stream off the turn holding its surface
// (`response.a2uiMessages`); thermidor derives it, so the fixture supplies it directly.
let mockTurns: unknown[] = [];

vi.mock('../../context/session.js', () => ({
  useSession: () => ({
    get turns() {
      return mockTurns;
    },
    subscribe: () => () => undefined,
  }),
}));

beforeEach(() => {
  mockTurns = [
    {
      response: {
        surfaces: [{surfaceId: 'ui-commerce-search', rootComponentType: 'CommerceSearch'}],
        a2uiMessages: [{version: 'v0.9', createSurface: {surfaceId: 'ui-commerce-search'}}],
      },
    },
  ];
});

vi.mock('../ProductTargeting/ProductTargeting.js', () => ({
  ProductTargeting: ({children}: {children: React.ReactNode}) => (
    <div data-testid="product-targeting">{children}</div>
  ),
}));

const defaultProps = {
  surfaceId: 'ui-commerce-search',
  onSubmit: vi.fn(),
  isStreaming: false,
  onBackToConversation: vi.fn(),
  products: [] as never[],
  onProductsChange: vi.fn(),
};

describe('SearchResultsPage', () => {
  it('mounts the commerce-search surface through the A2-UI renderer pipeline', () => {
    render(<SearchResultsPage {...defaultProps} />);

    expect(screen.getByTestId('a2ui-surfaces')).toBeDefined();
  });

  it('mounts only its own surface from a turn that also holds an agent answer', () => {
    mockTurns = [
      {
        response: {
          surfaces: [
            {surfaceId: 'agent-answer', rootComponentType: 'SearchOptions'},
            {surfaceId: 'ui-commerce-search', rootComponentType: 'CommerceSearch'},
          ],
          a2uiMessages: [
            {version: 'v0.9', createSurface: {surfaceId: 'agent-answer'}},
            {version: 'v0.9', createSurface: {surfaceId: 'ui-commerce-search'}},
          ],
        },
      },
      {
        response: {
          surfaces: [{surfaceId: 'later-answer', rootComponentType: 'ProductCarousel'}],
          a2uiMessages: [{version: 'v0.9', createSurface: {surfaceId: 'later-answer'}}],
        },
      },
    ];

    render(<SearchResultsPage {...defaultProps} />);

    expect(screen.getByTestId('a2ui-surfaces').textContent).toBe('ui-commerce-search');
  });

  it('wraps the A2-UI surfaces in ProductTargeting', () => {
    render(<SearchResultsPage {...defaultProps} />);

    const targeting = screen.getByTestId('product-targeting');
    expect(targeting.contains(screen.getByTestId('a2ui-surfaces'))).toBe(true);
  });

  it('renders a "Back to conversation" button that calls onBackToConversation', () => {
    const onBackToConversation = vi.fn();
    render(<SearchResultsPage {...defaultProps} onBackToConversation={onBackToConversation} />);

    fireEvent.click(screen.getByRole('button', {name: 'Back to conversation'}));

    expect(onBackToConversation).toHaveBeenCalledTimes(1);
  });
});

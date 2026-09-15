import {describe, it, expect, vi, beforeEach, type Mock} from 'vitest';
import type {ReactNode} from 'react';
import {render, screen} from '@testing-library/react';
import type {LayoutStackProps} from '@coveo/thermidor-schema';
import {LayoutStackRenderer} from './LayoutStack.js';

const baseProps: LayoutStackProps = {
  componentId: 'search-main',
  componentType: 'layout-stack',
};

// The renderer receives its ordered child ids and its `direction` on the resolved props
// (spread from the A2-UI node), neither of which the schema type surfaces.
function withProps(childIds: string[], direction?: string): LayoutStackProps {
  return {...baseProps, children: childIds, ...(direction ? {direction} : {})} as LayoutStackProps;
}

let mountFn: Mock<(id: string) => ReactNode>;

beforeEach(() => {
  mountFn = vi.fn<(id: string) => ReactNode>();
});

describe('LayoutStackRenderer', () => {
  it('renders a stable empty container with no children', () => {
    mountFn.mockReturnValue(null);
    render(<LayoutStackRenderer props={withProps([])} children={mountFn} />);

    expect(screen.getByTestId('search-main')).toBeDefined();
    expect(mountFn).not.toHaveBeenCalled();
  });

  it('mounts each declared child exactly once, in declared order', () => {
    const childIds = ['query-summary-2', 'product-list-2', 'pagination-2'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<LayoutStackRenderer props={withProps(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
    const renderedOrder = screen
      .getAllByTestId(/^child-/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(childIds.map((id) => `child-${id}`));
  });

  it('defaults to column direction when direction is absent', () => {
    render(<LayoutStackRenderer props={withProps([])} children={mountFn} />);
    expect(screen.getByTestId('search-main').getAttribute('data-direction')).toBe('column');
  });

  it('applies row direction when declared', () => {
    render(<LayoutStackRenderer props={withProps([], 'row')} children={mountFn} />);
    expect(screen.getByTestId('search-main').getAttribute('data-direction')).toBe('row');
  });

  it('falls back to column for an unknown direction value', () => {
    render(<LayoutStackRenderer props={withProps([], 'diagonal')} children={mountFn} />);
    expect(screen.getByTestId('search-main').getAttribute('data-direction')).toBe('column');
  });

  it('mounts solely from renderer inputs, not AG-UI state', () => {
    const childIds = ['facet-manager-2'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);
    render(<LayoutStackRenderer props={withProps(childIds)} children={mountFn} />);
    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
  });
});

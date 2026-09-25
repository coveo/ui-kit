import {describe, it, expect, vi, beforeEach, type Mock} from 'vitest';
import type {ReactNode} from 'react';
import {render, screen} from '@testing-library/react';
import type {LayoutStackProps} from '@coveo/thermidor-schema/zod3';
import {LayoutStackRenderer} from './LayoutStack.js';

type ResolvedProps = LayoutStackProps & {direction?: 'column' | 'row'};

// The renderer reads its ordered child ids and its `direction` presentation prop directly
// from the resolved props (the binder passes the static composition + presentation through).
function withProps(childIds: string[], direction?: 'column' | 'row'): ResolvedProps {
  return {children: childIds, ...(direction ? {direction} : {})} as ResolvedProps;
}

let mountFn: Mock<(id: string) => ReactNode>;

beforeEach(() => {
  mountFn = vi.fn<(id: string) => ReactNode>();
});

describe('LayoutStackRenderer', () => {
  it('renders a stable empty container with no children', () => {
    mountFn.mockReturnValue(null);
    render(<LayoutStackRenderer props={withProps([])} children={mountFn} />);

    expect(screen.getByTestId('layout-stack')).toBeDefined();
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
    expect(screen.getByTestId('layout-stack').getAttribute('data-direction')).toBe('column');
  });

  it('applies row direction when declared', () => {
    render(<LayoutStackRenderer props={withProps([], 'row')} children={mountFn} />);
    expect(screen.getByTestId('layout-stack').getAttribute('data-direction')).toBe('row');
  });

  it('mounts solely from the resolved props composition', () => {
    const childIds = ['facet-manager-2'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);
    render(<LayoutStackRenderer props={withProps(childIds)} children={mountFn} />);
    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
  });
});

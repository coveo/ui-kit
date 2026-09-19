import {describe, it, expect, vi, beforeEach, type Mock} from 'vitest';
import type {ReactNode} from 'react';
import {render, screen} from '@testing-library/react';
import type {CommerceSearchProps} from '@coveo/thermidor-schema';
import {CommerceSearchRenderer} from './CommerceSearch.js';

const props: CommerceSearchProps = {
  componentId: 'commerce-search-2',
  componentType: 'commerce-search',
};

// The renderer receives the ordered child ids on its resolved props (spread from the
// A2-UI node's `children`), which the schema type does not surface.
function withChildren(childIds: string[]): CommerceSearchProps {
  return {...props, children: childIds} as CommerceSearchProps;
}

let mountFn: Mock<(id: string) => ReactNode>;

beforeEach(() => {
  mountFn = vi.fn<(id: string) => ReactNode>();
});

describe('CommerceSearchRenderer', () => {
  it('renders a stable empty two-column layout with no children', () => {
    mountFn.mockReturnValue(null);
    render(<CommerceSearchRenderer props={props} children={mountFn} />);

    expect(screen.getByTestId('commerce-search-2')).toBeDefined();
    expect(mountFn).not.toHaveBeenCalled();
  });

  it('renders a stable empty layout without error when children is an empty list', () => {
    mountFn.mockReturnValue(null);
    render(<CommerceSearchRenderer props={withChildren([])} children={mountFn} />);

    expect(screen.getByTestId('commerce-search-2')).toBeDefined();
    expect(mountFn).not.toHaveBeenCalled();
  });

  it('mounts the first child into the sidebar and the second into the main area, in order', () => {
    const childIds = ['search-sidebar', 'search-main'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<CommerceSearchRenderer props={withChildren(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);

    const renderedOrder = screen
      .getAllByTestId(/^child-/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual(['child-search-sidebar', 'child-search-main']);
  });

  it('mounts only the sidebar child when a single child is declared', () => {
    const childIds = ['search-sidebar'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<CommerceSearchRenderer props={withChildren(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
    expect(screen.getByTestId('child-search-sidebar')).toBeDefined();
  });

  it('mounts any children beyond the first two after the main child, in declared order', () => {
    const childIds = ['search-sidebar', 'search-main', 'extra-1', 'extra-2'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<CommerceSearchRenderer props={withChildren(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
    const renderedOrder = screen
      .getAllByTestId(/^child-/)
      .map((node) => node.getAttribute('data-testid'));
    expect(renderedOrder).toEqual([
      'child-search-sidebar',
      'child-search-main',
      'child-extra-1',
      'child-extra-2',
    ]);
  });

  it('skips a declared child id with no corresponding component', () => {
    const childIds = ['search-sidebar', 'missing-main'];
    const present = new Set(['search-sidebar']);
    mountFn.mockImplementation((id: string) =>
      present.has(id) ? <span data-testid={`child-${id}`}>{id}</span> : null
    );

    render(<CommerceSearchRenderer props={withChildren(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
    expect(screen.queryByTestId('child-missing-main')).toBeNull();
    expect(screen.getByTestId('child-search-sidebar')).toBeDefined();
  });

  it('does not read composition from AG-UI state (mounts solely from renderer inputs)', () => {
    const childIds = ['search-sidebar', 'search-main'];
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<CommerceSearchRenderer props={withChildren(childIds)} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(childIds);
  });
});

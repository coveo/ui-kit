import {describe, it, expect, vi, beforeEach, type Mock} from 'vitest';
import type {ReactNode} from 'react';
import {render, screen} from '@testing-library/react';
import type {CommerceSearchProps} from '@coveo/thermidor-schema';
import {CommerceSearchRenderer} from './CommerceSearch.js';

type ResolvedProps = CommerceSearchProps;

function withSlots(sidebarChild?: string, mainChild?: string): ResolvedProps {
  return {
    ...(sidebarChild === undefined ? {} : {sidebarChild}),
    ...(mainChild === undefined ? {} : {mainChild}),
  } as ResolvedProps;
}

let mountFn: Mock<(id: string) => ReactNode>;

beforeEach(() => {
  mountFn = vi.fn<(id: string) => ReactNode>();
});

describe('CommerceSearchRenderer', () => {
  it('renders a stable empty two-column layout with no slots', () => {
    mountFn.mockReturnValue(null);
    render(<CommerceSearchRenderer props={withSlots()} children={mountFn} />);

    expect(screen.getByTestId('commerce-search')).toBeDefined();
    expect(mountFn).not.toHaveBeenCalled();
  });

  it('mounts the sidebarChild into the sidebar and the mainChild into the main area', () => {
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(
      <CommerceSearchRenderer
        props={withSlots('search-sidebar', 'search-main')}
        children={mountFn}
      />
    );

    // Slots are mounted by name, not by array position.
    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(['search-sidebar', 'search-main']);
    expect(screen.getByTestId('child-search-sidebar')).toBeDefined();
    expect(screen.getByTestId('child-search-main')).toBeDefined();
  });

  it('mounts only the sidebar slot when only sidebarChild is set', () => {
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(<CommerceSearchRenderer props={withSlots('search-sidebar')} children={mountFn} />);

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(['search-sidebar']);
    expect(screen.getByTestId('child-search-sidebar')).toBeDefined();
  });

  it('mounts only the main slot when only mainChild is set', () => {
    mountFn.mockImplementation((id: string) => <span data-testid={`child-${id}`}>{id}</span>);

    render(
      <CommerceSearchRenderer props={withSlots(undefined, 'search-main')} children={mountFn} />
    );

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(['search-main']);
    expect(screen.getByTestId('child-search-main')).toBeDefined();
  });

  it('skips a slot referencing an id with no corresponding component', () => {
    const present = new Set(['search-sidebar']);
    mountFn.mockImplementation((id: string) =>
      present.has(id) ? <span data-testid={`child-${id}`}>{id}</span> : null
    );

    render(
      <CommerceSearchRenderer
        props={withSlots('search-sidebar', 'missing-main')}
        children={mountFn}
      />
    );

    expect(mountFn.mock.calls.map((call) => call[0])).toEqual(['search-sidebar', 'missing-main']);
    expect(screen.queryByTestId('child-missing-main')).toBeNull();
    expect(screen.getByTestId('child-search-sidebar')).toBeDefined();
  });
});

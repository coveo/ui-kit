import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {QuerySummaryPlaceholder} from './QuerySummaryPlaceholder.js';

const defaultProps = {
  query: '',
  totalCount: 0,
  firstResult: 0,
  pageSize: 10,
  productCount: 0,
};

describe('QuerySummaryPlaceholder', () => {
  it('renders range and total with query', () => {
    render(
      <QuerySummaryPlaceholder
        {...defaultProps}
        query="shoes"
        totalCount={42}
        firstResult={0}
        productCount={10}
      />
    );

    expect(screen.getByText(/Products/)).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('shoes')).toBeDefined();
  });

  it('renders correct range for page 2', () => {
    render(
      <QuerySummaryPlaceholder
        {...defaultProps}
        query="boots"
        totalCount={50}
        firstResult={10}
        productCount={10}
      />
    );

    expect(screen.getByText('11')).toBeDefined();
    expect(screen.getByText('20')).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();
    expect(screen.getByText('boots')).toBeDefined();
  });

  it('renders without query portion when query is empty', () => {
    render(
      <QuerySummaryPlaceholder
        {...defaultProps}
        query=""
        totalCount={100}
        firstResult={0}
        productCount={25}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
    expect(screen.queryByText('for')).toBeNull();
  });

  it('renders "No results for" text when totalCount is 0 and query exists', () => {
    render(
      <QuerySummaryPlaceholder
        {...defaultProps}
        query="nonexistent"
        totalCount={0}
        productCount={0}
      />
    );

    expect(screen.getByText(/No results for/)).toBeDefined();
    expect(screen.getByText('nonexistent')).toBeDefined();
  });

  it('renders nothing when query is empty and totalCount is 0', () => {
    const {container} = render(
      <QuerySummaryPlaceholder {...defaultProps} query="" totalCount={0} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('bolds the range numbers, total count, and query', () => {
    render(
      <QuerySummaryPlaceholder
        {...defaultProps}
        query="kayaks"
        totalCount={200}
        firstResult={20}
        productCount={10}
      />
    );

    const strongElements = screen.getAllByText(
      (_, el) => el?.tagName === 'STRONG'
    );
    expect(strongElements.length).toBeGreaterThanOrEqual(4);
  });
});

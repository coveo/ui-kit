import {html, render} from 'lit';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  type HierarchicalPathProps,
  hierarchicalPath,
} from './hierarchical-path';

describe('#hierarchicalPath', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const renderPath = (props: HierarchicalPathProps) => {
    render(html`<div>${hierarchicalPath(props)}</div>`, container);
  };

  it('should render empty content for empty path', () => {
    renderPath({path: []});

    expect(container.textContent?.trim()).toBe('');
  });

  it('should render custom empty path content', () => {
    renderPath({
      path: [],
      emptyPathContent: html`<span>No path</span>`,
    });

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe('No path');
  });

  it('should render single path item without separator', () => {
    renderPath({path: ['electronics']});

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'electronics'
    );
  });

  it('should render multiple path items with separators', () => {
    renderPath({path: ['electronics', 'computers', 'laptops']});

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'electronics / computers / laptops'
    );
  });

  it('should use custom separator', () => {
    renderPath({
      path: ['electronics', 'computers'],
      separator: ' > ',
    });

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'electronics > computers'
    );
  });

  it('should apply custom CSS classes', () => {
    renderPath({
      path: ['electronics', 'computers'],
      separatorClass: 'custom-separator',
      itemClass: 'custom-item',
    });

    const spans = container.querySelectorAll('span');
    const separatorSpan = spans[1];
    const itemSpan = spans[0];

    expect(separatorSpan).toHaveClass('custom-separator');
    expect(itemSpan).toHaveClass('custom-item');
  });

  it('should not ellipse short paths', () => {
    renderPath({
      path: ['electronics', 'computers', 'laptops'],
      maxLength: 3,
    });

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).not.toContain(
      '...'
    );
    expect(container.textContent).toContain('electronics');
    expect(container.textContent).toContain('computers');
    expect(container.textContent).toContain('laptops');
  });

  it('should ellipse long paths', () => {
    renderPath({
      path: ['level1', 'level2', 'level3', 'level4', 'level5'],
      maxLength: 3,
    });

    expect(container.textContent).toContain('...');
    expect(container.textContent).toContain('level1');
    expect(container.textContent).toContain('level4');
    expect(container.textContent).toContain('level5');
    expect(container.textContent).not.toContain('level2');
    expect(container.textContent).not.toContain('level3');
  });

  it('should use custom ellipsis character', () => {
    renderPath({
      path: ['level1', 'level2', 'level3', 'level4'],
      maxLength: 3,
      ellipsis: '…',
    });

    expect(container.textContent).toContain('…');
    expect(container.textContent).not.toContain('...');
  });

  it('should apply ellipsis class to ellipsis element', () => {
    renderPath({
      path: ['level1', 'level2', 'level3', 'level4'],
      maxLength: 3,
      ellipsisClass: 'ellipsis-style',
    });

    const spans = container.querySelectorAll('span');
    const ellipsisSpan = Array.from(spans).find((span) =>
      span.textContent?.includes('...')
    );

    expect(ellipsisSpan).toHaveClass('ellipsis-style');
  });

  it('should handle edge case with maxLength of 1', () => {
    renderPath({
      path: ['level1', 'level2', 'level3'],
      maxLength: 1,
    });

    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toContain(
      'level1'
    );
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).not.toContain(
      '...'
    );
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).not.toContain(
      'level2'
    );
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).not.toContain(
      'level3'
    );
  });

  it('should handle exactly maxLength items', () => {
    renderPath({
      path: ['level1', 'level2', 'level3'],
      maxLength: 3,
    });

    expect(container.textContent).not.toContain('...');
    expect(container.textContent).toContain('level1');
    expect(container.textContent).toContain('level2');
    expect(container.textContent).toContain('level3');
  });

  it('should maintain correct order with ellipsis', () => {
    renderPath({
      path: ['a', 'b', 'c', 'd', 'e', 'f'],
      maxLength: 4,
    });

    const text = container.textContent || '';
    const aIndex = text.indexOf('a');
    const ellipsisIndex = text.indexOf('...');
    const dIndex = text.indexOf('d');
    const eIndex = text.indexOf('e');
    const fIndex = text.indexOf('f');

    expect(aIndex).toBeLessThan(ellipsisIndex);
    expect(ellipsisIndex).toBeLessThan(dIndex);
    expect(dIndex).toBeLessThan(eIndex);
    expect(eIndex).toBeLessThan(fIndex);
  });

  it('should render with template result as empty path content', () => {
    const customContent = html`<em>No categories selected</em>`;
    renderPath({
      path: [],
      emptyPathContent: customContent,
    });

    const em = container.querySelector('em');
    expect(em).toBeInTheDocument();
    expect(em?.textContent).toBe('No categories selected');
  });

  it('should handle single item path correctly', () => {
    renderPath({path: ['single-item']});

    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent?.trim()).toBe('single-item');
  });
});

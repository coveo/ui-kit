import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {userEvent} from '@vitest/browser/context';
import {html, nothing, TemplateResult} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {GridLayoutProps, renderGridLayout} from './grid-layout';

describe('renderGridLayout', () => {
  const gridLayoutFixture = async (
    props: Partial<GridLayoutProps> = {},
    children?: TemplateResult
  ) => {
    return await fixture(
      html`${renderGridLayout({
        props: {
          item: {clickUri: 'uri', title: 'title'},
          selectorForItem: '#test-child',
          setRef: () => {},
          ...props,
        },
      })(children || nothing)}`
    );
  };

  it('should render a grid layout element', async () => {
    const gridLayout = await gridLayoutFixture();

    expect(gridLayout).toBeInTheDocument();
  });

  it('should have the correct part', async () => {
    const gridLayout = await gridLayoutFixture();

    expect(
      gridLayout.part.contains('result-list-grid-clickable-container')
    ).toBe(true);

    expect(gridLayout.part.contains('outline')).toBe(true);
  });

  it('should render its children', async () => {
    const gridLayout = await gridLayoutFixture(
      {},
      html`<div>Test Child 1</div>
        <div>Test Child 2</div>`
    );

    expect(gridLayout.children.length).toBe(2);
    expect(gridLayout.children.item(0)?.textContent).toBe('Test Child 1');
    expect(gridLayout.children.item(1)?.textContent).toBe('Test Child 2');
    expect(gridLayout.children.item(0)).toBeInTheDocument();
    expect(gridLayout.children.item(1)).toBeInTheDocument();
  });

  it('should call #setRef with the rendered grid layout element', async () => {
    const setRef = vi.fn();

    const gridLayout = await gridLayoutFixture({setRef});

    expect(setRef).toHaveBeenCalledWith(gridLayout);
  });

  it('should click the child element matching #selectorForItem when clicked', async () => {
    const testChildHandleClick = vi.fn();

    const gridLayout = await gridLayoutFixture(
      {
        selectorForItem: '#test-child',
      },
      html`<button
        @click=${testChildHandleClick as Function}
        id="test-child"
      ></button>`
    );

    await userEvent.click(gridLayout);

    expect(testChildHandleClick).toHaveBeenCalled();
  });
});

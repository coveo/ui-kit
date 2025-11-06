import {html, nothing, type TemplateResult} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {type GridLayoutProps, renderGridLayout} from './grid-layout';

describe('renderGridLayout', () => {
  const gridLayoutFixture = async (
    props: Partial<GridLayoutProps> = {},
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return await fixture(
      html`${renderGridLayout({
        props: {
          item: {clickUri: 'uri', title: 'title'},
          selectorForItem: '#test-child',
          setRef: () => {},
          ...props,
        },
      })(children)}`
    );
  };

  it('should render a grid layout element in the document', async () => {
    const gridLayout = await gridLayoutFixture();

    expect(gridLayout).toBeInTheDocument();
  });

  it('should render the grid layout element with the correct part', async () => {
    const gridLayout = await gridLayoutFixture();

    expect(gridLayout.part).toContain('result-list-grid-clickable-container');
    expect(gridLayout.part).toContain('outline');
  });

  it('should render its children', async () => {
    const gridLayout = await gridLayoutFixture(
      {},
      html`<div class="child">Test Child 1</div>
        <div class="child">Test Child 2</div>`
    );

    const children = gridLayout.querySelectorAll('.child');

    expect(children).toHaveLength(2);
    expect(children.item(0)?.textContent).toBe('Test Child 1');
    expect(children.item(0)).toBeInTheDocument();
    expect(children.item(1)?.textContent).toBe('Test Child 2');
    expect(children.item(1)).toBeInTheDocument();
  });

  it('should call the #setRef prop function with the grid layout element', async () => {
    const setRef = vi.fn();

    const gridLayout = await gridLayoutFixture({setRef});

    expect(setRef).toHaveBeenCalledWith(gridLayout);
  });

  it('should click the child element matching the #selectorForItem prop value when clicked', async () => {
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

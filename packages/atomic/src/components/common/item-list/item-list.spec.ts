import {html, nothing, type TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {type ItemListProps, renderItemList} from './item-list';

describe('renderItemList', () => {
  const renderItemListWithChildren = async (
    props: Partial<ItemListProps> = {},
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return renderFunctionFixture(
      renderItemList({
        props: {
          hasError: false,
          hasItems: true,
          hasTemplate: true,
          firstRequestExecuted: true,
          templateHasError: false,
          ...props,
        },
      })(children)
    );
  };

  const testChild = html`<div class="child">Test Child</div>`;

  it.each([
    {
      description: 'all conditions are met',
      props: {},
    },
    {
      description: '#firstRequestExecuted is false and #hasItems is true',
      props: {firstRequestExecuted: false, hasItems: true},
    },
    {
      description: '#firstRequestExecuted is false and #hasItems is false',
      props: {firstRequestExecuted: false, hasItems: false},
    },
  ])('should render children when $description', async ({props}) => {
    const element = await renderItemListWithChildren(props, testChild);
    const child = element.querySelector('.child');

    expect(child).toBeInTheDocument();
    expect(child?.textContent).toBe('Test Child');
  });

  it.each([
    {
      description: '#hasError is true',
      props: {hasError: true},
    },
    {
      description: '#hasTemplate is false',
      props: {hasTemplate: false},
    },
    {
      description: '#firstRequestExecuted is true and #hasItems is false',
      props: {firstRequestExecuted: true, hasItems: false},
    },
  ])('should not render children when $description', async ({props}) => {
    const element = await renderItemListWithChildren(props, testChild);
    const child = element.querySelector('.child');

    expect(child).not.toBeInTheDocument();
  });
});

import {html, nothing, type TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderTabWrapper} from './tab-wrapper';

describe('renderTabWrapper', () => {
  const renderTabWrapperWithChildren = async (
    props: {
      tabsIncluded?: string | string[];
      tabsExcluded?: string | string[];
      activeTab: string;
    },
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return renderFunctionFixture(
      renderTabWrapper({
        props: {
          tabsIncluded: props.tabsIncluded ?? [],
          tabsExcluded: props.tabsExcluded ?? [],
          activeTab: props.activeTab,
        },
      })(children)
    );
  };

  const testChild = html`<div class="child">Test Child</div>`;

  it.each([
    {
      description: 'no tabs are specified',
      props: {activeTab: 'products'},
    },
    {
      description: 'activeTab is included in tabsIncluded',
      props: {tabsIncluded: ['products', 'services'], activeTab: 'products'},
    },
    {
      description: 'tabsIncluded is empty',
      props: {tabsIncluded: [], activeTab: 'products'},
    },
    {
      description: 'activeTab is empty and tabsIncluded is specified',
      props: {tabsIncluded: ['products'], activeTab: ''},
    },
  ])('should render children when $description', async ({props}) => {
    const element = await renderTabWrapperWithChildren(props, testChild);
    const child = element.querySelector('.child');

    expect(child).toBeInTheDocument();
    expect(child?.textContent).toBe('Test Child');
  });

  it.each([
    {
      description: 'activeTab is excluded in tabsExcluded',
      props: {tabsExcluded: ['products', 'services'], activeTab: 'products'},
    },
    {
      description: 'activeTab is not included in tabsIncluded',
      props: {tabsIncluded: ['services', 'support'], activeTab: 'products'},
    },
    {
      description: 'activeTab is excluded even if also included',
      props: {
        tabsIncluded: ['products'],
        tabsExcluded: ['products'],
        activeTab: 'products',
      },
    },
  ])('should not render children when $description', async ({props}) => {
    const element = await renderTabWrapperWithChildren(props, testChild);
    const child = element.querySelector('.child');

    expect(child).not.toBeInTheDocument();
  });
});

import {html, nothing, render, type TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderTabWrapper} from './tab-wrapper';

describe('renderTabWrapper', () => {
  const renderTabWrapperWithChildren = (
    props: {
      tabsIncluded?: string | string[];
      tabsExcluded?: string | string[];
      activeTab: string;
    },
    children: TemplateResult | typeof nothing = nothing
  ) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      renderTabWrapper({
        props: {
          tabsIncluded: props.tabsIncluded ?? [],
          tabsExcluded: props.tabsExcluded ?? [],
          activeTab: props.activeTab,
        },
      })(children),
      container
    );

    return container;
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
  ])('should render children when $description', ({props}) => {
    const container = renderTabWrapperWithChildren(props, testChild);
    const child = container.querySelector('.child');

    expect(child).toBeInTheDocument();
    expect(child?.textContent).toBe('Test Child');

    container.remove();
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
  ])('should not render children when $description', ({props}) => {
    const container = renderTabWrapperWithChildren(props, testChild);
    const child = container.querySelector('.child');

    expect(child).not.toBeInTheDocument();

    container.remove();
  });
});

import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderNoItemsContainer} from './container';

describe('#renderNoItemsContainer', () => {
  const renderComponent = async (childrenContent?: string) => {
    const children = childrenContent ? html`${childrenContent}` : html``;
    const element = await renderFunctionFixture(
      html`${renderNoItemsContainer()(children)}`
    );

    return {
      container: element.querySelector('div'),
      slot: element.querySelector('slot'),
      element,
    };
  };

  it('should render a div container', async () => {
    const {container} = await renderComponent();

    expect(container).toBeInTheDocument();
    expect(container?.tagName.toLowerCase()).toBe('div');
  });

  it('should render children content inside the div', async () => {
    const childContent = 'Test child content';
    const {container} = await renderComponent(childContent);

    expect(container).toContainHTML(childContent);
  });

  it('should render the slot element next to the div', async () => {
    const {slot} = await renderComponent();

    expect(slot).toBeInTheDocument();
    expect(slot?.tagName.toLowerCase()).toBe('slot');
  });
});

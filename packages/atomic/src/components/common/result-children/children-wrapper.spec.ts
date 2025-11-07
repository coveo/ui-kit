import {html, nothing} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderChildrenWrapper} from './children-wrapper';

describe('#renderChildrenWrapper', () => {
  const renderComponent = async (children = html`<div>Test content</div>`) => {
    const element = await renderFunctionFixture(
      html`${renderChildrenWrapper()(children)}`
    );

    return {
      divElement: element.querySelector('div[part="children-root"]'),
      beforeSlot: element.querySelector('slot[name="before-children"]'),
      afterSlot: element.querySelector('slot[name="after-children"]'),
      content: element.textContent?.trim(),
    };
  };

  it('should render a div element with part "children-root"', async () => {
    const {divElement} = await renderComponent();

    expect(divElement).toHaveAttribute('part', 'children-root');
  });

  it('should render children content', async () => {
    const {content} = await renderComponent();

    expect(content).toContain('Test content');
  });

  describe('when children are provided', () => {
    it('should render before-children slot', async () => {
      const {beforeSlot} = await renderComponent(html`<div>Test content</div>`);

      expect(beforeSlot).toHaveAttribute('name', 'before-children');
    });

    it('should render after-children slot', async () => {
      const {afterSlot} = await renderComponent(html`<div>Test content</div>`);

      expect(afterSlot).toHaveAttribute('name', 'after-children');
    });
  });

  describe('when no children are provided', () => {
    it('should not render before-children slot', async () => {
      const {beforeSlot} = await renderComponent(nothing);

      expect(beforeSlot).toBeNull();
    });

    it('should not render after-children slot', async () => {
      const {afterSlot} = await renderComponent(nothing);

      expect(afterSlot).toBeNull();
    });
  });
});

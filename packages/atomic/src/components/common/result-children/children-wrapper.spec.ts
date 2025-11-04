import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderChildrenWrapper} from './children-wrapper';

describe('#renderChildrenWrapper', () => {
  const renderComponent = async ({hasChildren = false} = {}) => {
    const element = await renderFunctionFixture(
      html`${renderChildrenWrapper({props: {hasChildren}})(html`<div>Test content</div>`)}`
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

  describe('when hasChildren is true', () => {
    it('should render before-children slot', async () => {
      const {beforeSlot} = await renderComponent({hasChildren: true});

      expect(beforeSlot).toHaveAttribute('name', 'before-children');
    });

    it('should render after-children slot', async () => {
      const {afterSlot} = await renderComponent({hasChildren: true});

      expect(afterSlot).toHaveAttribute('name', 'after-children');
    });
  });

  describe('when hasChildren is false', () => {
    it('should not render before-children slot', async () => {
      const {beforeSlot} = await renderComponent({hasChildren: false});

      expect(beforeSlot).toBeNull();
    });

    it('should not render after-children slot', async () => {
      const {afterSlot} = await renderComponent({hasChildren: false});

      expect(afterSlot).toBeNull();
    });
  });
});

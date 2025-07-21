import {html, nothing, type TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import type {ItemDisplayLayout} from '@/src/components';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type DisplayWrapperProps,
  renderDisplayWrapper,
} from './display-wrapper';

describe('renderDisplayWrapper', () => {
  const displayWrapperFixture = async (
    props: Partial<DisplayWrapperProps> = {},
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return await fixture(
      html`${renderDisplayWrapper({
        props: {display: 'grid', listClasses: '', ...props},
      })(children)}`
    );
  };

  describe("when display is 'table'", () => {
    it('should render a list wrapper element in the document', async () => {
      const displayWrapper = await displayWrapperFixture({
        display: 'table',
      });

      expect(displayWrapper).toBeInTheDocument();
      expect(displayWrapper).toHaveClass('list-wrapper');
    });

    it("should apply the #listClasses prop value to the list wrapper element's 'class' attribute", async () => {
      const listRoot = await displayWrapperFixture({
        listClasses: 'test-class-1 test-class-2',
      });

      expect(listRoot).toHaveClass('test-class-1');
      expect(listRoot).toHaveClass('test-class-2');
    });

    it('should not render a list root element in the document', async () => {
      const displayWrapper = await displayWrapperFixture({
        display: 'table',
      });

      expect(
        displayWrapper.querySelector('.list-root')
      ).not.toBeInTheDocument();
    });

    it('should render its children', async () => {
      const displayWrapper = await displayWrapperFixture(
        {display: 'table'},
        html`<div>Test Child 1</div>
          <div>Test Child 2</div>`
      );

      expect(displayWrapper.children.length).toBe(2);
      expect(displayWrapper.children.item(0)).toBeInTheDocument();
      expect(displayWrapper.children.item(0)?.textContent).toBe('Test Child 1');
      expect(displayWrapper.children.item(1)).toBeInTheDocument();
      expect(displayWrapper.children.item(1)?.textContent).toBe('Test Child 2');
    });
  });

  describe.each<{display: ItemDisplayLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    it('should render a list wrapper element in the document', async () => {
      const displayWrapper = await displayWrapperFixture({
        display,
      });

      expect(displayWrapper).toBeInTheDocument();
      expect(displayWrapper).toHaveClass('list-wrapper');
    });

    it("should apply the #listClasses prop value to the list wrapper element's 'class' attribute", async () => {
      const displayWrapper = await displayWrapperFixture({
        listClasses: 'test-class-1 test-class-2',
      });

      expect(displayWrapper).toHaveClass('test-class-1');
      expect(displayWrapper).toHaveClass('test-class-2');
    });

    it('should render a list root element under the list wrapper element in the document', async () => {
      const displayWrapper = await displayWrapperFixture({
        display,
      });

      const listRootElements = displayWrapper.querySelectorAll('.list-root');

      expect(listRootElements).toHaveLength(1);
      expect(listRootElements.item(0)).toBeInTheDocument();
      expect(listRootElements.item(0)).toHaveClass('list-root');
      expect(listRootElements.item(0).parentElement).toHaveClass(
        'list-wrapper'
      );
    });

    it('should render the list root element with the correct part', async () => {
      const displayWrapper = await displayWrapperFixture({
        display,
      });

      const listRootElement = displayWrapper.querySelector('.list-root');

      expect(listRootElement?.part.value).toBe('result-list');
    });

    it("should apply the #listClasses prop value to the list root element's 'class' attribute", async () => {
      const displayWrapper = await displayWrapperFixture({
        listClasses: 'test-class-1 test-class-2',
      });

      const listRootElement = displayWrapper.querySelector('.list-root');

      expect(listRootElement).toHaveClass('test-class-1');
      expect(listRootElement).toHaveClass('test-class-2');
    });

    it('should render its children under the list root element', async () => {
      const displayWrapper = await displayWrapperFixture(
        {display},
        html`<div class="child">Test Child 1</div>
          <div class="child">Test Child 2</div>`
      );

      const children = displayWrapper.querySelectorAll('.child');

      expect(children).toHaveLength(2);
      expect(children.item(0)).toBeInTheDocument();
      expect(children.item(0).parentElement).toHaveClass('list-root');
      expect(children.item(0).textContent).toBe('Test Child 1');
      expect(children.item(1)).toBeInTheDocument();
      expect(children.item(1).parentElement).toHaveClass('list-root');
      expect(children.item(1).textContent).toBe('Test Child 2');
    });
  });
});

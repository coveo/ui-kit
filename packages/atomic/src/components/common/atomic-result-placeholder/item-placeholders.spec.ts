import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import type {ItemDisplayLayout} from '@/src/components';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type ItemPlaceholdersProps,
  renderItemPlaceholders,
} from './item-placeholders';

describe('renderItemPlaceholders', () => {
  const itemPlaceholdersFixture = async (
    props: Partial<ItemPlaceholdersProps> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderItemPlaceholders({
        props: {
          density: 'normal',
          display: 'grid',
          imageSize: 'large',
          numberOfPlaceholders: 2,
          ...props,
        },
      })}`
    );
  };

  describe("when #display is 'table'", () => {
    it('should render an atomic-result-table-placeholder element in the document', async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display: 'table',
      });

      const atomicResultTablePlaceholderElements =
        itemPlaceholders.querySelectorAll('atomic-result-table-placeholder');

      expect(atomicResultTablePlaceholderElements).toHaveLength(1);
      expect(atomicResultTablePlaceholderElements.item(0)).toBeInTheDocument();
    });

    it("should apply the #density prop value to the placeholder element's 'density' attribute", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        density: 'compact',
        display: 'table',
      });

      const atomicTableResultPlaceholderElement =
        itemPlaceholders.querySelector('atomic-result-table-placeholder');

      expect(atomicTableResultPlaceholderElement?.density).toBe('compact');
    });

    it("should apply the #imageSize prop value to the placeholder element's 'imageSize' attribute", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display: 'table',
        imageSize: 'small',
      });

      const atomicTableResultPlaceholderElement =
        itemPlaceholders.querySelector('atomic-result-table-placeholder');

      expect(atomicTableResultPlaceholderElement?.imageSize).toBe('small');
    });

    it("should apply the #numberOfPlaceholders prop value to the placeholder element's 'rows' attribute", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display: 'table',
        numberOfPlaceholders: 12,
      });

      const placeholderElement = itemPlaceholders.querySelector(
        'atomic-result-table-placeholder'
      );

      expect(placeholderElement?.rows).toBe(12);
    });
  });

  describe.each<{display: ItemDisplayLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    it('should render the correct number of atomic-result-placeholder elements in the document', async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display,
        numberOfPlaceholders: 12,
      });

      const atomicResultPlaceholderElements = itemPlaceholders.querySelectorAll(
        'atomic-result-placeholder'
      );

      expect(atomicResultPlaceholderElements).toHaveLength(12);
      atomicResultPlaceholderElements.forEach((placeholder) => {
        expect(placeholder).toBeInTheDocument();
      });
    });

    it("should apply the #density prop value to the element's 'density' attribute of each placeholder element", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        density: 'compact',
        display,
      });

      const atomicResultPlaceholderElements = itemPlaceholders.querySelectorAll(
        'atomic-result-placeholder'
      );

      atomicResultPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.density).toBe('compact');
      });
    });

    it("should apply the #display prop value to the element's 'display' attribute of each placeholder element", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display,
      });

      const atomicResultPlaceholderElements = itemPlaceholders.querySelectorAll(
        'atomic-result-placeholder'
      );

      atomicResultPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.display).toBe(display);
      });
    });

    it("should apply the #imageSize prop value to the element's 'imageSize' attribute of each placeholder element", async () => {
      const itemPlaceholders = await itemPlaceholdersFixture({
        display,
        imageSize: 'small',
      });

      const atomicPlaceholderElements = itemPlaceholders.querySelectorAll(
        'atomic-result-placeholder'
      );

      atomicPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.imageSize).toBe('small');
      });
    });
  });
});

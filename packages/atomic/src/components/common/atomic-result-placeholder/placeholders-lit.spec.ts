import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {
  renderResultPlaceholders,
  renderTableResultPlaceholders,
  ResultPlaceholderProps,
} from './placeholders-lit';

describe('renderResultPlaceholders', () => {
  const resultPlaceholdersFixture = async (
    props: Partial<ResultPlaceholderProps> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderResultPlaceholders({
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

  it('should render the correct number of atomic-result-placeholder', async () => {
    const resultPlaceholders = await resultPlaceholdersFixture({
      numberOfPlaceholders: 12,
    });

    const atomicResultPlaceholderElements = resultPlaceholders.querySelectorAll(
      'atomic-result-placeholder'
    );

    expect(atomicResultPlaceholderElements.length).toBe(12);
  });

  describe('when rendering an atomic-result-placeholder', () => {
    it("should pass the correct 'density' attribute", async () => {
      const resultPlaceholders = await resultPlaceholdersFixture({
        density: 'compact',
      });

      const atomicResultPlaceholderElements =
        resultPlaceholders.querySelectorAll('atomic-result-placeholder');

      atomicResultPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.density).toBe('compact');
      });
    });

    it("should pass the correct 'display' attribute", async () => {
      const resultPlaceholders = await resultPlaceholdersFixture({
        display: 'list',
      });

      const atomicResultPlaceholderElements =
        resultPlaceholders.querySelectorAll('atomic-result-placeholder');

      atomicResultPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.display).toBe('list');
      });
    });

    it("should pass the correct 'imageSize' attribute", async () => {
      const resultPlaceholders = await resultPlaceholdersFixture({
        imageSize: 'small',
      });

      const atomicPlaceholderElements = resultPlaceholders.querySelectorAll(
        'atomic-result-placeholder'
      );

      atomicPlaceholderElements.forEach((placeholder) => {
        expect(placeholder.imageSize).toBe('small');
      });
    });
  });
});

describe('renderTableResultPlaceholders', () => {
  const tableResultPlaceholdersFixture = async (
    props: Partial<Omit<ResultPlaceholderProps, 'display'>> = {}
  ) => {
    return await renderFunctionFixture(
      html`${renderTableResultPlaceholders({
        props: {
          density: 'normal',
          imageSize: 'large',
          numberOfPlaceholders: 2,
          ...props,
        },
      })}`
    );
  };

  it('should render 1 atomic-result-table-placeholder', async () => {
    const tableResultPlaceholders = await tableResultPlaceholdersFixture({});

    const atomicResultTablePlaceholderElements =
      tableResultPlaceholders.querySelectorAll(
        'atomic-result-table-placeholder'
      );

    expect(atomicResultTablePlaceholderElements.length).toBe(1);
  });

  describe('when rendering the atomic-result-table-placeholder element', () => {
    it("should pass the correct 'density' attribute", async () => {
      const tableResultPlaceholders = await tableResultPlaceholdersFixture({
        density: 'compact',
      });

      const atomicTableResultPlaceholderElement =
        tableResultPlaceholders.querySelector(
          'atomic-result-table-placeholder'
        );

      expect(atomicTableResultPlaceholderElement?.density).toBe('compact');
    });

    it("should pass the correct 'imageSize' attribute", async () => {
      const tableResultPlaceholders = await tableResultPlaceholdersFixture({
        imageSize: 'small',
      });

      const atomicTableResultPlaceholderElement =
        tableResultPlaceholders.querySelector(
          'atomic-result-table-placeholder'
        );

      expect(atomicTableResultPlaceholderElement?.imageSize).toBe('small');
    });

    it("should pass the correct 'rows' attribute", async () => {
      const tableResultPlaceholders = await tableResultPlaceholdersFixture({
        numberOfPlaceholders: 12,
      });

      const placeholderElement = tableResultPlaceholders.querySelector(
        'atomic-result-table-placeholder'
      );

      expect(placeholderElement?.rows).toBe(12);
    });
  });
});

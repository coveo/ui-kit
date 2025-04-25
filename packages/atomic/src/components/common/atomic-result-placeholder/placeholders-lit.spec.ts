import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {html} from 'lit';
import {describe, beforeEach, expect, test} from 'vitest';
import {
  renderResultPlaceholders,
  renderTableResultPlaceholders,
  ResultPlaceholderProps,
} from './placeholders-lit';

describe('renderResultPlaceholders', () => {
  const setupElement = async (props: Partial<ResultPlaceholderProps>) => {
    return await renderFunctionFixture(
      html`${renderResultPlaceholders({
        props: {
          density: props.density || 'normal',
          display: props.display || 'grid',
          imageSize: props.imageSize || 'large',
          numberOfPlaceholders: props.numberOfPlaceholders || 2,
        },
      })}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render correct # of atomic-result-placeholder', async () => {
    const numberOfPlaceholders = 12;
    const element = await setupElement({numberOfPlaceholders});
    const placeholderElements = element.querySelectorAll(
      'atomic-result-placeholder'
    );

    expect(placeholderElements.length).toBe(numberOfPlaceholders);
  });

  describe('each atomic-result-placeholder', () => {
    test('should receive correct #density', async () => {
      const density = 'compact';
      const element = await setupElement({density});
      const placeholderElements = element.querySelectorAll(
        'atomic-result-placeholder'
      );

      placeholderElements.forEach((placeholder) => {
        expect(placeholder.density).toBe(density);
      });
    });

    test('should receive correct #display', async () => {
      const display = 'list';
      const element = await setupElement({display});
      const placeholderElements = element.querySelectorAll(
        'atomic-result-placeholder'
      );

      placeholderElements.forEach((placeholder) => {
        expect(placeholder.display).toBe(display);
      });
    });

    test('should receive correct #imageSize', async () => {
      const imageSize = 'small';
      const element = await setupElement({imageSize});
      const placeholderElements = element.querySelectorAll(
        'atomic-result-placeholder'
      );

      placeholderElements.forEach((placeholder) => {
        expect(placeholder.imageSize).toBe(imageSize);
      });
    });
  });
});

describe('renderTableResultPlaceholders', () => {
  const setupElement = async (
    props: Partial<Omit<ResultPlaceholderProps, 'display'>>
  ) => {
    return await renderFunctionFixture(
      html`${renderTableResultPlaceholders({
        props: {
          density: props.density || 'normal',
          imageSize: props.imageSize || 'large',
          numberOfPlaceholders: props.numberOfPlaceholders || 2,
        },
      })}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render 1 atomic-result-table-placeholder element', async () => {
    const element = await setupElement({});
    const placeholderElements = element.querySelectorAll(
      'atomic-result-table-placeholder'
    );

    expect(placeholderElements.length).toBe(1);
  });

  describe('the atomic-result-table-placeholder', () => {
    test('should receive correct #density', async () => {
      const density = 'compact';
      const element = await setupElement({density});
      const placeholderElement = element.querySelector(
        'atomic-result-table-placeholder'
      );

      expect(placeholderElement?.density).toBe(density);
    });

    test('should receive correct #imageSize', async () => {
      const imageSize = 'small';
      const element = await setupElement({imageSize});
      const placeholderElement = element.querySelector(
        'atomic-result-table-placeholder'
      );

      expect(placeholderElement?.imageSize).toBe(imageSize);
    });

    test('should receive correct #rows', async () => {
      const numberOfPlaceholders = 12;
      const element = await setupElement({numberOfPlaceholders});
      const placeholderElement = element.querySelector(
        'atomic-result-table-placeholder'
      );

      expect(placeholderElement?.rows).toBe(numberOfPlaceholders);
    });
  });
});

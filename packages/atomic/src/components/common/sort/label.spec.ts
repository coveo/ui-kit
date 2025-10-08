import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderSortLabel, type SortLabelProps} from './label';

describe('#renderSortLabel', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    label(element: Element) {
      return element.querySelector('[part="label"]')!;
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (props: Partial<SortLabelProps>) => {
    return await renderFunctionFixture(
      html`${renderSortLabel({
        props: {
          id: props?.id || 'sort-label',
          i18n: props?.i18n || i18n,
        },
      })}`
    );
  };

  it('renders correctly with valid props', async () => {
    const element = await setupElement({
      id: 'sort-label',
    });

    const label = locators.label(element);
    await expect.element(label).toHaveAttribute('for', 'sort-label');
    await expect.element(label).toHaveAttribute('part', 'label');
  });

  it('renders the correct translated text', async () => {
    const element = await setupElement({
      id: 'sort-label',
    });

    const label = locators.label(element);
    await expect.element(label).toHaveTextContent('Sort by:');
  });
});

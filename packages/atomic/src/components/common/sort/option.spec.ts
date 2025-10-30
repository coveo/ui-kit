import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderSortOption, type SortOptionProps} from './option';

describe('#renderSortOption', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  const locators = {
    option({selected}: {selected: boolean} = {selected: false}) {
      return page.getByRole('option', {selected});
    },
  };

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const setupElement = async (props: Partial<SortOptionProps>) => {
    return await renderFunctionFixture(
      html`${renderSortOption({
        props: {
          i18n: props?.i18n || i18n,
          value: props?.value || 'some value',
          selected: props?.selected || false,
          label: props?.label || 'some-label',
        },
      })}`
    );
  };

  it('renders correctly with valid props', async () => {
    await setupElement({
      value: 'foo',
      label: 'Foo',
    });

    const option = locators.option();
    await expect.element(option).toHaveAttribute('value', 'foo');
    await expect.element(option).toHaveTextContent('Foo');
  });

  it('renders as not selected when the selected prop is false', async () => {
    await setupElement({
      selected: false,
    });

    const option = locators.option();
    await expect.element(option).toBeInTheDocument();
  });

  it('renders as selected when the selected prop is true', async () => {
    await setupElement({
      selected: true,
    });

    const option = locators.option({selected: true});
    await expect.element(option).toBeInTheDocument();
  });

  it('renders the correct label using i18n', async () => {
    await setupElement({
      i18n: (await createTestI18n()).addResourceBundle('en', 'translation', {
        Baz: 'Hello Baz',
      }),
      value: 'baz',
      label: 'Baz',
    });

    const option = locators.option();
    await expect.element(option).toHaveTextContent('Hello Baz');
  });
});

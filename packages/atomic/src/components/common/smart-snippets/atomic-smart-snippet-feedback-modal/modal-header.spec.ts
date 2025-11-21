import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderModalHeader} from './modal-header';

describe('#renderModalHeader', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async () => {
    return await renderFunctionFixture(
      html`${renderModalHeader({
        props: {i18n},
      })}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render h1 element with slot="header"', async () => {
    const element = await renderComponent();
    const header = element.querySelector('h1[slot="header"]');

    expect(header).not.toBeNull();
    expect(header?.tagName).toBe('H1');
  });

  it('should render translated header text', async () => {
    const element = await renderComponent();
    const header = element.querySelector('h1[slot="header"]');

    expect(header).toHaveTextContent(
      i18n.t('smart-snippet-feedback-explain-why')
    );
  });
});

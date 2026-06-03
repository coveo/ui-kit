import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderModalOptions} from './modal-options';

describe('#renderModalOptions', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async () => {
    return await renderFunctionFixture(
      html`${renderModalOptions({
        props: {i18n},
      })(html`<div>Child options</div>`)}`
    );
  };

  it('should render with valid props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render fieldset element', async () => {
    const element = await renderComponent();
    const fieldset = element.querySelector('fieldset');

    expect(fieldset).not.toBeNull();
    expect(fieldset?.tagName).toBe('FIELDSET');
  });

  it('should render legend with correct attributes and classes', async () => {
    const element = await renderComponent();
    const legend = element.querySelector('legend');

    expect(legend).not.toBeNull();
    expect(legend?.part).toContain('reason-title');
    expect(legend).toHaveClass('text-on-background', 'text-lg', 'font-bold');
  });

  it('should render translated legend text', async () => {
    const element = await renderComponent();
    const legend = element.querySelector('legend');

    expect(legend).toHaveTextContent(
      i18n.t('smart-snippet-feedback-select-reason')
    );
  });

  it('should render children inside fieldset', async () => {
    const element = await renderComponent();
    const fieldset = element.querySelector('fieldset');

    expect(fieldset).toHaveTextContent('Child options');
  });
});

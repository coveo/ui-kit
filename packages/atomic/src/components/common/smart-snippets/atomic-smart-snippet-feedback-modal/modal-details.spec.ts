import type {SmartSnippetFeedback} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderModalDetails} from './modal-details';

describe('#renderModalDetails', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    currentAnswer?: SmartSnippetFeedback | 'other',
    detailsInputRef?: (el: Element | undefined) => void
  ) => {
    return await renderFunctionFixture(
      html`${renderModalDetails({
        props: {currentAnswer, i18n, detailsInputRef},
      })}`
    );
  };

  it('should render with valid props when currentAnswer is "other"', async () => {
    const element = await renderComponent('other');
    expect(element).toBeDefined();
  });

  it('should not render when currentAnswer is not "other"', async () => {
    const element = await renderComponent('does_not_answer');
    const fieldset = element.querySelector('fieldset');

    expect(fieldset).toBeNull();
  });

  it('should not render when currentAnswer is undefined', async () => {
    const element = await renderComponent();
    const fieldset = element.querySelector('fieldset');

    expect(fieldset).toBeNull();
  });

  it('should render fieldset when currentAnswer is "other"', async () => {
    const element = await renderComponent('other');
    const fieldset = element.querySelector('fieldset');

    expect(fieldset).not.toBeNull();
    expect(fieldset?.tagName).toBe('FIELDSET');
  });

  it('should render legend with correct attributes and classes', async () => {
    const element = await renderComponent('other');
    const legend = element.querySelector('legend');

    expect(legend).not.toBeNull();
    expect(legend?.part).toContain('details-title');
    expect(legend).toHaveClass('text-on-background', 'text-lg', 'font-bold');
  });

  it('should render translated legend text', async () => {
    const element = await renderComponent('other');
    const legend = element.querySelector('legend');

    expect(legend).toHaveTextContent(i18n.t('details'));
  });

  it('should render textarea with correct attributes', async () => {
    const element = await renderComponent('other');
    const textarea = element.querySelector('textarea');

    expect(textarea).not.toBeNull();
    expect(textarea?.getAttribute('name')).toBe('answer-details');
    expect(textarea?.part).toContain('details-input');
    expect(textarea?.getAttribute('rows')).toBe('4');
    expect(textarea?.hasAttribute('required')).toBe(true);
  });

  it('should apply ref when detailsInputRef is provided', async () => {
    const detailsInputRef = vi.fn();

    const element = await renderComponent('other', detailsInputRef);
    const textarea = element.querySelector('textarea');

    expect(detailsInputRef).toHaveBeenCalledWith(textarea);
  });
});

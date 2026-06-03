import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderCorrection} from './correction';

describe('#renderCorrection', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderCorrection({
        props: {
          i18n,
          correctedQuery: 'corrected query',
          onClick: vi.fn(),
          ...overrides,
        },
      })}`
    );

    return {
      paragraph: element.querySelector('p[part="did-you-mean"]'),
      correctionButton: element.querySelector('button[part="correction-btn"]'),
    };
  };

  it('should render the part "did-you-mean" on the paragraph', async () => {
    const {paragraph} = await renderComponent();

    expect(paragraph).toHaveAttribute('part', 'did-you-mean');
  });

  it('should render the part "correction-btn" on the button', async () => {
    const {correctionButton} = await renderComponent();

    expect(correctionButton).toHaveAttribute('part', 'correction-btn');
  });

  it('should render the corrected query text in the button', async () => {
    const {correctionButton} = await renderComponent({
      correctedQuery: 'my corrected query',
    });

    expect(correctionButton).toHaveTextContent('my corrected query');
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    const {correctionButton} = await renderComponent({onClick});

    await userEvent.click(correctionButton!);

    expect(onClick).toHaveBeenCalledOnce();
  });
});

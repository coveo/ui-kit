import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {userEvent} from '@storybook/test';
import {i18n} from 'i18next';
import {html} from 'lit';
import {describe, beforeAll, it, expect, vi} from 'vitest';
import {renderTriggerCorrection} from './trigger-correction';

describe('#renderTriggerCorrection', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderTriggerCorrection({
        props: {
          i18n,
          correctedQuery: 'corrected query',
          originalQuery: 'original query',
          onClick: () => {},
          ...overrides,
        },
      })}`
    );

    return {
      paragraphShowingResultsFor: element.querySelector(
        'p[part="showing-results-for"]'
      ),
      paragraphSearchInsteadFor: element.querySelector(
        'p[part="search-instead-for"]'
      ),
      buttonUndo: element.querySelector('button[part="undo-btn"]'),
    };
  };

  it('should render the part "showing-results-for" on the first paragraph', async () => {
    const {paragraphShowingResultsFor} = await renderComponent();

    expect(paragraphShowingResultsFor).toHaveAttribute(
      'part',
      'showing-results-for'
    );
  });

  it('should render the correct text on the first paragraph', async () => {
    const {paragraphShowingResultsFor} = await renderComponent();

    expect(paragraphShowingResultsFor).toHaveTextContent(
      'Showing results for corrected query'
    );
  });

  it('should render the part "search-instead-for" on the second paragraph', async () => {
    const {paragraphSearchInsteadFor} = await renderComponent();

    expect(paragraphSearchInsteadFor).toHaveAttribute(
      'part',
      'search-instead-for'
    );
  });

  it('should render the correct text on the second paragraph', async () => {
    const {paragraphSearchInsteadFor} = await renderComponent();

    expect(paragraphSearchInsteadFor).toHaveTextContent(
      'Search instead for original query'
    );
  });

  it('should render a button with the part "undo-btn"', async () => {
    const {buttonUndo} = await renderComponent();

    expect(buttonUndo).toHaveAttribute('part', 'undo-btn');
  });

  it('should call the onClick function when the button is clicked', async () => {
    const onClick = vi.fn();
    const {buttonUndo} = await renderComponent({onClick});

    await userEvent.click(buttonUndo!);

    expect(onClick).toHaveBeenCalled();
  });
});

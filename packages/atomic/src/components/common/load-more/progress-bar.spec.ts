import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {renderLoadMoreProgressBar} from './progress-bar';

describe('#renderLoadMoreProgressBar', () => {
  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderLoadMoreProgressBar({
        props: {
          from: 10,
          to: 100,
          ...overrides,
        },
      })}`
    );

    return {
      progressContainer: element.querySelector('div[part="progress-bar"]'),
      progressBar: element.querySelector('.progress-bar'),
    };
  };

  it('should render the part "progress-bar" on the container div', async () => {
    const {progressContainer} = await renderComponent();

    expect(progressContainer).toHaveAttribute('part', 'progress-bar');
  });

  it('should calculate the correct width percentage for the progress bar', async () => {
    const {progressBar} = await renderComponent({from: 25, to: 100});

    expect(progressBar).toHaveStyle('width: 25%');
  });

  it('should handle fractional percentages by rounding up', async () => {
    const {progressBar} = await renderComponent({from: 33, to: 100});

    expect(progressBar).toHaveStyle('width: 33%');
  });

  it('should handle edge case when from equals to', async () => {
    const {progressBar} = await renderComponent({from: 100, to: 100});

    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('should handle edge case when from is 0', async () => {
    const {progressBar} = await renderComponent({from: 0, to: 100});

    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('should handle division by zero when to is 0', async () => {
    const {progressBar} = await renderComponent({from: 50, to: 0});

    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('should handle edge case when both from and to are 0', async () => {
    const {progressBar} = await renderComponent({from: 0, to: 0});

    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('should clamp percentage to 100% when from exceeds to', async () => {
    const {progressBar} = await renderComponent({from: 150, to: 100});

    expect(progressBar).toHaveStyle('width: 100%');
  });
});

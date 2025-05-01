import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {userEvent} from '@storybook/test';
import {html} from 'lit';
import {describe, vi, beforeAll, it} from 'vitest';
import {expect} from 'vitest';
import {renderSubmitButton} from './submit-button';

describe('#renderSubmitButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = (additionalProps = {}) => {
    return renderFunctionFixture(
      html`${renderSubmitButton({
        props: {
          i18n,
          ...additionalProps,
        },
      })}`
    );
  };

  it('should have the "submit-button-wrapper" part on the wrapper', async () => {
    const element = await renderComponent();
    const wrapper = element.querySelector('div');
    expect(wrapper).toHaveAttribute('part', 'submit-button-wrapper');
  });

  it('should have the "btn-text-primary" class on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button');
    expect(button).toHaveClass('btn-text-primary');
  });

  it('should have the "submit-button" part on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button');
    expect(button).toHaveAttribute('part', 'submit-button');
  });

  it('should have the right aria-label on the button', async () => {
    const element = await renderComponent();
    const button = element.querySelector('button');
    expect(button).toHaveAttribute('aria-label', 'Search');
  });

  it('should trigger the onClick event when clicked', async () => {
    const onClick = vi.fn();
    const element = await renderComponent({onClick});
    const button = element.querySelector('button');

    await userEvent.click(button!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should have the "submit-icon" part on the atomic-icon', async () => {
    const element = await renderComponent();
    const icon = element.querySelector('atomic-icon');
    expect(icon).toHaveAttribute('part', 'submit-icon');
  });

  it('should have an svg icon on the atomic-icon', async () => {
    const element = await renderComponent();
    const icon = element.querySelector('atomic-icon');
    expect(icon?.getAttribute('icon')).toContain('<svg');
  });
});

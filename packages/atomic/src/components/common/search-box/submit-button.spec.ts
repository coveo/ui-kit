import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderSubmitButton} from './submit-button';

describe('#renderSubmitButton', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (additionalProps = {}) => {
    const element = await renderFunctionFixture(
      html`${renderSubmitButton({
        props: {
          i18n,
          disabled: false,
          onClick: () => {},
          ...additionalProps,
        },
      })}`
    );
    return {
      element,
      wrapper: element.querySelector('div'),
      button: element.querySelector('button'),
      icon: element.querySelector('atomic-icon'),
    };
  };

  it('should have the "submit-button-wrapper" part on the wrapper', async () => {
    const {wrapper} = await renderComponent();
    expect(wrapper).toHaveAttribute('part', 'submit-button-wrapper');
  });

  it('should have the "btn-text-primary" class on the button', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveClass('btn-text-primary');
  });

  it('should have the "submit-button" part on the button', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('part', 'submit-button');
  });

  it('should have the right aria-label on the button', async () => {
    const {button} = await renderComponent();
    expect(button).toHaveAttribute('aria-label', 'Search');
  });

  it('should trigger the onClick event when clicked', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent({onClick});

    await userEvent.click(button!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should have the "submit-icon" part on the atomic-icon', async () => {
    const {icon} = await renderComponent();
    expect(icon).toHaveAttribute('part', 'submit-icon');
  });

  it('should have an svg icon on the atomic-icon', async () => {
    const {icon} = await renderComponent();
    expect(icon?.getAttribute('icon')).toContain('<svg');
  });

  it('should be disabled when the disabled prop is true', async () => {
    const {button} = await renderComponent({disabled: true});
    expect(button).toBeDisabled();
  });

  it('should trigger the onClick event when the button is clicked', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent({onClick});

    await userEvent.click(button!);

    expect(onClick).toHaveBeenCalled();
  });
});

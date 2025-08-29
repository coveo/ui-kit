import type {i18n} from 'i18next';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {renderRefineToggleButton} from './button';

describe('#renderRefineToggleButton', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const element = await renderFunctionFixture(
      html`${renderRefineToggleButton({
        props: {
          i18n,
          onClick: () => {},
          refCallback: () => {},
          ...overrides,
        },
      })}`
    );

    return {
      button: element.querySelector('button[part="button"]'),
    };
  };

  it('should render a button with the part "button"', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveAttribute('part', 'button');
  });

  it('should render the correct text from i18n', async () => {
    const {button} = await renderComponent();

    expect(button).toHaveTextContent('Sort & Filter');
  });

  it('should call the onClick function when clicked', async () => {
    const onClick = vi.fn();
    const {button} = await renderComponent({onClick});

    await userEvent.click(button!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should call refCallback with the button element', async () => {
    const refCallback = vi.fn();
    await renderComponent({refCallback});

    expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});

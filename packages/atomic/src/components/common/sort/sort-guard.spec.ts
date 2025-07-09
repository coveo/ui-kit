import {html, noChange, nothing, type TemplateResult} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {sortGuard} from './sort-guard';

describe('sortGuard', () => {
  const renderContent = () => html`<div>Rendered Content</div>`;
  const locators = {
    placeholder(element: Element) {
      return element.querySelector('[part="placeholder"]')!;
    },
  };

  it('renders noChange when isLoading is true', () => {
    const result = sortGuard(
      {
        isLoading: true,
        firstSearchExecuted: true,
        hasResults: true,
        hasError: false,
      },
      renderContent
    );

    expect(result).toBe(noChange);
  });

  it('renders a placeholder when firstSearchExecuted is false', async () => {
    const element = await renderFunctionFixture(
      sortGuard(
        {
          isLoading: false,
          firstSearchExecuted: false,
          hasResults: true,
          hasError: false,
        },
        renderContent
      ) as TemplateResult
    );

    const placeholder = () => locators.placeholder(element);
    await vi.waitUntil(placeholder);

    await expect.element(placeholder()).toBeInTheDocument();
  });

  it('renders nothing when hasResults is false', () => {
    const result = sortGuard(
      {
        isLoading: false,
        firstSearchExecuted: true,
        hasResults: false,
        hasError: false,
      },
      renderContent
    );

    expect(result).toBe(nothing);
  });

  it('renders nothing when hasError is true', () => {
    const result = sortGuard(
      {
        isLoading: false,
        firstSearchExecuted: true,
        hasResults: true,
        hasError: true,
      },
      renderContent
    );

    expect(result).toBe(nothing);
  });

  it('renders content when all conditions are met', () => {
    const result = sortGuard(
      {
        isLoading: false,
        firstSearchExecuted: true,
        hasResults: true,
        hasError: false,
      },
      renderContent
    );

    expect(result).toEqual(renderContent());
  });
});

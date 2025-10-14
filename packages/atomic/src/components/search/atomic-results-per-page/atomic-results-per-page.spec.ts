import {buildResultsPerPage, buildSearchStatus} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture.js';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeResultsPerPage} from '@/vitest-utils/testing-helpers/fixtures/headless/search/results-per-page-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicResultsPerPage} from './atomic-results-per-page';
import './atomic-results-per-page';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-results-per-page', () => {
  const mockedEngine = buildFakeSearchEngine();
  beforeEach(async () => {
    console.error = vi.fn();
  });

  const renderResultsPerPage = async ({
    props = {},
  }: {
    props?: {
      choicesDisplayed?: string;
      initialChoice?: number;
    };
  } = {}) => {
    vi.mocked(buildSearchStatus).mockReturnValue(buildFakeSearchStatus());
    vi.mocked(buildResultsPerPage).mockReturnValue(
      buildFakeResultsPerPage({
        numberOfResults: props.initialChoice ?? 10,
      })
    );

    const {element} = await renderInAtomicSearchInterface<AtomicResultsPerPage>(
      {
        template: html`<atomic-results-per-page choices-displayed=${ifDefined(props.choicesDisplayed)}
          initial-choice=${ifDefined(props.initialChoice)}
      ></atomic-results-per-page>`,
        selector: 'atomic-results-per-page',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      }
    );

    return {
      element,
      get radioButtons() {
        return element.shadowRoot?.querySelectorAll('input[type="radio"]');
      },
      parts: (element: AtomicResultsPerPage) => {
        const qs = (part: string) =>
          element?.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          buttons: qs('buttons'),
        };
      },
    };
  };

  it('should render correctly with radio buttons container', async () => {
    const {element, parts} = await renderResultsPerPage({});

    expect(parts(element).buttons).toBeDefined();
    expect(parts(element).buttons?.getAttribute('role')).toBe('radiogroup');
  });

  it('should render default choices as radio buttons', async () => {
    const {radioButtons} = await renderResultsPerPage();

    expect(radioButtons).toHaveLength(4); // Default: 10,25,50,100

    const values = Array.from(radioButtons || []).map(
      (button) => (button as HTMLInputElement).value
    );
    expect(values).toEqual(['10', '25', '50', '100']);
  });

  it('should build search status controller', async () => {
    const {element} = await renderResultsPerPage();

    expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.searchStatus).toBeDefined();
  });

  it('should build results per page controller', async () => {
    const {element} = await renderResultsPerPage();

    expect(buildResultsPerPage).toHaveBeenCalledWith(element.bindings.engine, {
      initialState: {numberOfResults: 10},
    });
    expect(element.resultPerPage).toBeDefined();
  });

  it('should render custom choices as radio buttons with correct values', async () => {
    const choicesDisplayed = '5,15,30';
    const initialChoice = 5;
    const {radioButtons} = await renderResultsPerPage({
      props: {
        choicesDisplayed,
        initialChoice,
      },
    });

    expect(radioButtons).toHaveLength(3);

    const values = Array.from(radioButtons || []).map(
      (button) => (button as HTMLInputElement).value
    );
    expect(values).toEqual(['5', '15', '30']);
  });

  it('should mark correct radio button as checked based on initial choice', async () => {
    const {radioButtons} = await renderResultsPerPage({
      props: {
        choicesDisplayed: '10,25,50',
        initialChoice: 25,
      },
    });

    const checkedButton = Array.from(radioButtons || []).find(
      (button) => (button as HTMLInputElement).checked
    );

    expect(checkedButton).toBeDefined();
    expect((checkedButton as HTMLInputElement).value).toBe('25');
  });

  it('should have correct radio button group name for all buttons', async () => {
    const {radioButtons} = await renderResultsPerPage();

    const groupNames = Array.from(radioButtons || []).map(
      (button) => (button as HTMLInputElement).name
    );

    // All radio buttons should have the same group name
    expect(groupNames.every((name) => name === groupNames[0])).toBe(true);
    expect(groupNames[0]).toMatch(/^atomic-results-per-page-/); // Should start with component prefix
  });

  it('should render radio buttons with correct part attributes', async () => {
    const {radioButtons} = await renderResultsPerPage({
      props: {
        choicesDisplayed: '10,25',
        initialChoice: 25,
      },
    });

    const button10 = Array.from(radioButtons || []).find(
      (button) => (button as HTMLInputElement).value === '10'
    );
    const button25 = Array.from(radioButtons || []).find(
      (button) => (button as HTMLInputElement).value === '25'
    );

    expect(button10?.getAttribute('part')).toBe('button');
    expect(button25?.getAttribute('part')).toBe('button active-button');
  });

  describe('when search has error', () => {
    it('should not render when search status has error', async () => {
      const {element} = await renderResultsPerPage();

      // Update the bound state to simulate error condition
      // biome-ignore lint/suspicious/noExplicitAny: test mock assignment
      (element as any).searchStatusState = {
        hasError: true,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;

      // Trigger re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });

  describe('when no results available', () => {
    it('should not render when search has no results', async () => {
      const {element} = await renderResultsPerPage();

      // Update the bound state to simulate no results condition
      // biome-ignore lint/suspicious/noExplicitAny: test mock assignment
      (element as any).searchStatusState = {
        hasError: false,
        hasResults: false,
        isLoading: false,
        firstSearchExecuted: true,
      };
      element.isAppLoaded = true;

      // Trigger re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(element.shadowRoot?.textContent?.trim()).toBe('');
    });
  });
});

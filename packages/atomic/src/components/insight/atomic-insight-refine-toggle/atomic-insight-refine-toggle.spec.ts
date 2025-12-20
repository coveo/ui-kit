import {
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import type {AtomicInsightRefineToggle} from './atomic-insight-refine-toggle';
import './atomic-insight-refine-toggle';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-refine-toggle', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedSearchStatus: SearchStatus;

  interface RenderRefineToggleOptions {
    searchStatusState?: Partial<SearchStatusState>;
  }

  const renderRefineToggle = async ({
    searchStatusState,
  }: RenderRefineToggleOptions = {}) => {
    mockedSearchStatus = buildFakeSearchStatus({
      firstSearchExecuted: true,
      hasResults: true,
      hasError: false,
      ...searchStatusState,
    });

    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightRefineToggle>({
        template: html`<atomic-insight-refine-toggle></atomic-insight-refine-toggle>`,
        selector: 'atomic-insight-refine-toggle',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
      get button() {
        return element.shadowRoot?.querySelector('button');
      },
      get modal() {
        return (element.getRootNode() as Document | ShadowRoot)?.querySelector(
          'atomic-insight-refine-modal'
        );
      },
    };
  };

  it('should call buildSearchStatus with the engine', async () => {
    await renderRefineToggle();

    expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set this.searchStatus to the search status controller', async () => {
    const {element} = await renderRefineToggle();

    expect(element.searchStatus).toBe(mockedSearchStatus);
  });

  it('should render nothing if there is an error', async () => {
    const {element} = await renderRefineToggle({
      searchStatusState: {
        hasError: true,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder if the first request has not been executed', async () => {
    const {placeholder} = await renderRefineToggle({
      searchStatusState: {
        firstSearchExecuted: false,
      },
    });

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('part', 'placeholder');
  });

  it('should render nothing if there are no results', async () => {
    const {element} = await renderRefineToggle({
      searchStatusState: {
        hasResults: false,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render the button with the correct text', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveTextContent('Sort & Filter');
  });

  it('should render the button with the correct part', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveAttribute('part', 'button');
  });

  it('should create the modal when rendered', async () => {
    const {modal} = await renderRefineToggle();

    expect(modal).toBeInTheDocument();
  });

  it('should set the openButton of the modal to the button', async () => {
    const {button, modal} = await renderRefineToggle();

    expect(modal?.openButton).toBe(button);
  });

  it('should open the modal when the button is clicked', async () => {
    const {button, modal} = await renderRefineToggle();

    await userEvent.click(button!);

    expect(modal?.isOpen).toBe(true);
  });
});

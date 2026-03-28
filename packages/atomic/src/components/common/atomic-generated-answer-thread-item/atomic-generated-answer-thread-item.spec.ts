import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {
  AtomicGeneratedAnswerThreadItem,
  AtomicGeneratedAnswerThreadItemProps,
} from './atomic-generated-answer-thread-item';
import '@/src/components/common/atomic-generated-answer-thread-item/atomic-generated-answer-thread-item';

describe('atomic-generated-answer-thread-item', () => {
  const renderComponent = async (
    props: Partial<AtomicGeneratedAnswerThreadItemProps> = {},
    children = html`<div>Thread item content</div>`
  ) => {
    const element = await fixture<AtomicGeneratedAnswerThreadItem>(html`
      <atomic-generated-answer-thread-item
        .title=${props.title ?? 'Title'}
        .disableCollapse=${props.disableCollapse ?? false}
        .hideLine=${props.hideLine ?? false}
        .isExpanded=${props.isExpanded ?? true}
        .showTimelineDot=${props.showTimelineDot ?? true}
      >
        ${children}
      </atomic-generated-answer-thread-item>
    `);

    return {
      element,
      locators: () => ({
        timelineDot: element.shadowRoot?.querySelector('span.h-2.w-2') ?? null,
        timelineLine: element.shadowRoot?.querySelector('span.w-px') ?? null,
        threadItemTitle:
          element.shadowRoot?.querySelector('[part="thread-item-title"]') ??
          null,
        titleButton: element.shadowRoot?.querySelector('button') ?? null,
        contentRegion:
          element.shadowRoot?.querySelector(
            'div[id^="atomic-generated-answer-thread-item-content-"]'
          ) ?? null,
        contentState:
          element.shadowRoot?.querySelector(
            'div[id^="atomic-generated-answer-thread-item-content-"] > div[aria-hidden]'
          ) ?? null,
      }),
    };
  };

  it('should render the timeline dot and content container', async () => {
    const {locators} = await renderComponent();

    expect(locators().timelineDot).toBeInTheDocument();
    expect(locators().contentRegion).toBeInTheDocument();
  });

  it('should hide the timeline dot when showTimelineDot is false', async () => {
    const {locators} = await renderComponent({showTimelineDot: false});

    expect(locators().timelineDot).toBeNull();
  });

  it('should hide the timeline line when hideLine is true', async () => {
    const {locators} = await renderComponent({hideLine: true});

    expect(locators().timelineLine).toBeNull();
  });

  it('should keep the timeline line visible when collapsed', async () => {
    const {locators} = await renderComponent({
      hideLine: false,
      isExpanded: false,
    });

    expect(locators().timelineLine).toBeInTheDocument();
  });

  it('should render a faded divider under content when expanded', async () => {
    const {locators} = await renderComponent({isExpanded: true});

    expect(locators().contentState).toHaveAttribute('aria-hidden', 'false');
  });

  it('should not render divider when collapsed', async () => {
    const {locators} = await renderComponent({isExpanded: false});

    expect(locators().contentState).toHaveAttribute('hidden');
    expect(locators().contentState).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a title button when collapsible', async () => {
    const {locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeInTheDocument();
    expect(locators().contentState).toHaveAttribute('hidden');
  });

  it('should link the title button to the content region', async () => {
    const {locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    const contentRegion = locators().contentRegion as HTMLElement;
    const contentState = locators().contentState as HTMLElement;

    expect(titleButton).toHaveAttribute('aria-expanded', 'false');
    expect(contentRegion).toHaveAttribute('id');
    expect(titleButton).toHaveAttribute('aria-controls', contentRegion.id);
    expect(contentState).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a title span when not collapsible', async () => {
    const {locators} = await renderComponent({
      disableCollapse: true,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeNull();
    expect(locators().contentState).not.toHaveAttribute('hidden');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const {element, locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    titleButton.click();
    await element.updateComplete;

    expect(locators().contentState).not.toHaveAttribute('hidden');
  });

  it('should update aria attributes when toggled', async () => {
    const {element, locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    const contentState = locators().contentState as HTMLElement;

    titleButton.click();
    await element.updateComplete;

    expect(titleButton).toHaveAttribute('aria-expanded', 'true');
    expect(contentState).toHaveAttribute('aria-hidden', 'false');
    expect(contentState).not.toHaveAttribute('hidden');
  });

  it('should render content when content slot is provided', async () => {
    const contentSlot = html`<div>Slotted content</div>`;
    const {locators} = await renderComponent(
      {
        disableCollapse: true,
        isExpanded: true,
      },
      contentSlot
    );

    const contentSlotElement = locators().contentState?.querySelector(
      'slot'
    ) as HTMLSlotElement | null;
    const assignedElements = contentSlotElement?.assignedElements() ?? [];

    expect(assignedElements.length).toBe(1);
    expect(assignedElements[0]).toHaveTextContent('Slotted content');
  });

  it('should clamp title to 3 lines', async () => {
    const {locators} = await renderComponent();
    const title = locators().threadItemTitle as HTMLElement;

    const style = title.getAttribute('style') ?? '';
    expect(style).toContain('display: -webkit-box');
    expect(style).toContain('-webkit-line-clamp: 3');
    expect(style).toContain('-webkit-box-orient: vertical');
    expect(style).toContain('overflow: hidden');
  });
});

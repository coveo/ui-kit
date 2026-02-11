import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {
  AtomicAnswersThreadItem,
  AtomicAnswersThreadItemProps,
} from './atomic-answers-thread-item';
import '@/src/components/search/atomic-answers-thread-item/atomic-answers-thread-item';

describe('#atomic-answers-thread-item', () => {
  const renderComponent = async (
    props: Partial<AtomicAnswersThreadItemProps> = {},
    children = html`<div>Thread item content</div>`
  ) => {
    const element = await fixture<AtomicAnswersThreadItem>(html`
      <atomic-answers-thread-item
        .title=${props.title ?? 'Title'}
        .isCollapsible=${props.isCollapsible ?? false}
        .hideLine=${props.hideLine ?? false}
        .isExpanded=${props.isExpanded ?? true}
      >
        ${children}
      </atomic-answers-thread-item>
    `);

    return {
      element,
      locators: () => ({
        timelineDot: element.shadowRoot?.querySelector('span.h-2.w-2') ?? null,
        timelineLine: element.shadowRoot?.querySelector('span.w-px') ?? null,
        titleButton: element.shadowRoot?.querySelector('button') ?? null,
        content: element.shadowRoot?.querySelector('div[aria-hidden]') ?? null,
        statusSlot:
          element.shadowRoot?.querySelector('slot[name="status"]') ?? null,
      }),
    };
  };

  it('should render the timeline dot and content container', async () => {
    const {locators} = await renderComponent();

    expect(locators().timelineDot).toBeInTheDocument();
    expect(locators().content).toBeInTheDocument();
  });

  it('should hide the timeline line when hideLine is true', async () => {
    const {locators} = await renderComponent({hideLine: true});

    expect(locators().timelineLine).toBeNull();
  });

  it('should render a title button when collapsible', async () => {
    const {locators} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeInTheDocument();
    expect(locators().content).toHaveAttribute('hidden');
  });

  it('should link the title button to the content region', async () => {
    const {locators} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    const content = locators().content as HTMLElement;

    expect(titleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a title span when not collapsible', async () => {
    const {locators} = await renderComponent({
      isCollapsible: false,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeNull();
    expect(locators().content).not.toHaveAttribute('hidden');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const {element, locators} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    titleButton.click();
    await element.updateComplete;

    expect(locators().content).not.toHaveAttribute('hidden');
  });

  it('should update aria attributes when toggled', async () => {
    const {element, locators} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    const content = locators().content as HTMLElement;

    titleButton.click();
    await element.updateComplete;

    expect(titleButton).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('aria-hidden', 'false');
    expect(content).not.toHaveAttribute('hidden');
  });

  it('should render status slot only when expanded', async () => {
    const statusSlot = html`<span slot="status">Thinking...</span>`;
    const {locators: collapsedLocators} = await renderComponent(
      {
        isCollapsible: true,
        isExpanded: false,
      },
      statusSlot
    );

    expect(collapsedLocators().statusSlot).toBeNull();

    const {locators: expandedLocators} = await renderComponent(
      {
        isCollapsible: true,
        isExpanded: true,
      },
      statusSlot
    );

    expect(expandedLocators().statusSlot).toBeInTheDocument();
  });

  it('should render content when content slot is provided', async () => {
    const contentSlot = html`<div>Slotted content</div>`;
    const {locators} = await renderComponent(
      {
        isCollapsible: false,
        isExpanded: true,
      },
      contentSlot
    );

    const contentSlotElement = locators().content?.querySelector(
      'slot'
    ) as HTMLSlotElement | null;
    const assignedElements = contentSlotElement?.assignedElements() ?? [];

    expect(assignedElements.length).toBe(1);
    expect(assignedElements[0]).toHaveTextContent('Slotted content');
  });
});

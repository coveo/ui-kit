import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {
  GeneratedAnswerThreadItem,
  GeneratedAnswerThreadItemProps,
} from './generated-answer-thread-item';
import '@/src/components/common/generated-answer/generated-answer-thread-item/generated-answer-thread-item';

describe('generated-answer-thread-item', () => {
  const renderComponent = async (
    props: Partial<GeneratedAnswerThreadItemProps> = {},
    children = html`<div>Thread item content</div>`
  ) => {
    const element = await fixture<GeneratedAnswerThreadItem>(html`
      <generated-answer-thread-item
        .title=${props.title ?? 'Title'}
        .disableCollapse=${props.disableCollapse ?? false}
        .hideLine=${props.hideLine ?? false}
        .isExpanded=${props.isExpanded ?? true}
      >
        ${children}
      </generated-answer-thread-item>
    `);

    return {
      element,
      locators: () => ({
        timelineDot: element.shadowRoot?.querySelector('span.h-2.w-2') ?? null,
        timelineLine: element.shadowRoot?.querySelector('span.w-px') ?? null,
        contentDivider:
          element.shadowRoot?.querySelector('.thread-content-divider') ?? null,
        titleButton: element.shadowRoot?.querySelector('button') ?? null,
        content: element.shadowRoot?.querySelector('div[aria-hidden]') ?? null,
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

  it('should keep the timeline line visible when collapsed', async () => {
    const {locators} = await renderComponent({
      hideLine: false,
      isExpanded: false,
    });

    expect(locators().timelineLine).toBeInTheDocument();
  });

  it('should render a faded divider under content when expanded', async () => {
    const {locators} = await renderComponent({isExpanded: true});

    expect(locators().contentDivider).toBeInTheDocument();
  });

  it('should not render a faded divider when collapsed', async () => {
    const {locators} = await renderComponent({isExpanded: false});

    expect(locators().contentDivider).toBeNull();
  });

  it('should render a title button when collapsible', async () => {
    const {locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeInTheDocument();
    expect(locators().content).toHaveAttribute('hidden');
  });

  it('should link the title button to the content region', async () => {
    const {locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    const content = locators().content as HTMLElement;

    expect(titleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('id');
    expect(titleButton).toHaveAttribute('aria-controls', content.id);
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a title span when not collapsible', async () => {
    const {locators} = await renderComponent({
      disableCollapse: true,
      isExpanded: false,
    });

    expect(locators().titleButton).toBeNull();
    expect(locators().content).not.toHaveAttribute('hidden');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const {element, locators} = await renderComponent({
      disableCollapse: false,
      isExpanded: false,
    });

    const titleButton = locators().titleButton as HTMLButtonElement;
    titleButton.click();
    await element.updateComplete;

    expect(locators().content).not.toHaveAttribute('hidden');
  });

  it('should update aria attributes when toggled', async () => {
    const {element, locators} = await renderComponent({
      disableCollapse: false,
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

  it('should render content when content slot is provided', async () => {
    const contentSlot = html`<div>Slotted content</div>`;
    const {locators} = await renderComponent(
      {
        disableCollapse: true,
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

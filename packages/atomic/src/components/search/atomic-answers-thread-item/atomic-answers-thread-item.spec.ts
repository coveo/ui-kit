import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {
  AtomicAnswersThreadItem,
  AtomicAnswersThreadItemProps,
} from './atomic-answers-thread-item';
import '@/src/components/search/atomic-answers-thread-item/atomic-answers-thread-item';

describe('#AtomicAnswersThreadItem', () => {
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
        .onToggle=${props.onToggle}
      >
        ${children}
      </atomic-answers-thread-item>
    `);

    return {
      element,
      parts: () => ({
        item: element.shadowRoot?.querySelector('[part="item"]') ?? null,
        timeline:
          element.shadowRoot?.querySelector('[part="timeline"]') ?? null,
        timelineDot:
          element.shadowRoot?.querySelector('[part="timeline-dot"]') ?? null,
        timelineLine:
          element.shadowRoot?.querySelector('[part="timeline-line"]') ?? null,
        header: element.shadowRoot?.querySelector('[part="header"]') ?? null,
        title: element.shadowRoot?.querySelector('[part="title"]') ?? null,
        titleButton:
          element.shadowRoot?.querySelector('[part="title-button"]') ?? null,
        content: element.shadowRoot?.querySelector('[part="content"]') ?? null,
      }),
    };
  };

  it('should render the thread item parts', async () => {
    const {parts} = await renderComponent();

    expect(parts().item).toBeInTheDocument();
    expect(parts().timeline).toBeInTheDocument();
    expect(parts().timelineDot).toBeInTheDocument();
    expect(parts().timelineLine).toBeInTheDocument();
    expect(parts().header).toBeInTheDocument();
    expect(parts().content).toBeInTheDocument();
  });

  it('should hide the timeline line when hideLine is true', async () => {
    const {parts} = await renderComponent({hideLine: true});

    expect(parts().timelineLine).toBeNull();
  });

  it('should render a title button when collapsible', async () => {
    const {parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    expect(parts().titleButton).toBeInTheDocument();
    expect(parts().title).toBeNull();
    expect(parts().content).toHaveAttribute('hidden');
  });

  it('should link the title button to the content region', async () => {
    const {parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    const titleButton = parts().titleButton as HTMLButtonElement;
    const content = parts().content as HTMLElement;

    expect(titleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a title span when not collapsible', async () => {
    const {parts} = await renderComponent({
      isCollapsible: false,
      isExpanded: false,
    });

    expect(parts().title).toBeInTheDocument();
    expect(parts().titleButton).toBeNull();
    expect(parts().content).not.toHaveAttribute('hidden');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const onToggle = vi.fn();
    const {element, parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
      onToggle,
    });

    const titleButton = parts().titleButton as HTMLButtonElement;
    titleButton.click();
    await element.updateComplete;

    expect(onToggle).toHaveBeenCalledWith(true);
    expect(parts().content).not.toHaveAttribute('hidden');
  });

  it('should update aria attributes when toggled', async () => {
    const {element, parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });

    const titleButton = parts().titleButton as HTMLButtonElement;
    const content = parts().content as HTMLElement;

    titleButton.click();
    await element.updateComplete;

    expect(titleButton).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('aria-hidden', 'false');
    expect(content).not.toHaveAttribute('hidden');
  });
});

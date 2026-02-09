import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import './atomic-answers-thread-item';
import type {AtomicAnswersThreadItem} from './atomic-answers-thread-item';

describe('atomic-answers-thread-item', () => {
  const renderComponent = async (
    props: Partial<AtomicAnswersThreadItem> = {},
    slottedContent = html`<div>Thread item content</div>`
  ) => {
    const element = await fixture<AtomicAnswersThreadItem>(
      html`<atomic-answers-thread-item
        .title=${props.title ?? 'Title'}
        .isCollapsible=${props.isCollapsible ?? false}
        .hideLine=${props.hideLine ?? false}
        .isExpanded=${props.isExpanded ?? true}
      >
        ${slottedContent}
      </atomic-answers-thread-item>`
    );

    return {
      element,
      parts: () => ({
        item: element.shadowRoot?.querySelector('[part="item"]'),
        timeline: element.shadowRoot?.querySelector('[part="timeline"]'),
        timelineDot: element.shadowRoot?.querySelector('[part="timeline-dot"]'),
        timelineLine: element.shadowRoot?.querySelector(
          '[part="timeline-line"]'
        ),
        header: element.shadowRoot?.querySelector('[part="header"]'),
        title: element.shadowRoot?.querySelector('[part="title"]'),
        titleButton: element.shadowRoot?.querySelector('[part="title-button"]'),
        content: element.shadowRoot?.querySelector('[part="content"]'),
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
    expect(parts().content?.textContent).toBe('');
  });

  it('should render a title span when not collapsible', async () => {
    const {parts} = await renderComponent({isCollapsible: false});

    expect(parts().title).toBeInTheDocument();
    expect(parts().titleButton).toBeNull();
    expect(parts().content?.textContent).toContain('Thread item content');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const {element, parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
    });
    const onToggle = vi.fn();
    element.addEventListener('toggle', onToggle);

    const titleButton = parts().titleButton as HTMLButtonElement;
    titleButton.click();
    await element.updateComplete;

    expect(element.isExpanded).toBe(true);
    expect(parts().content?.textContent).toContain('Thread item content');
    expect(onToggle).toHaveBeenCalledTimes(1);
    const event = onToggle.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({expanded: true});
  });
});

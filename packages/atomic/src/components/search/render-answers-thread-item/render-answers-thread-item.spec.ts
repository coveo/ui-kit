import {html, nothing} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type RenderAnswersThreadItemProps,
  renderAnswersThreadItem,
} from './render-answers-thread-item';

describe('#renderAnswersThreadItem', () => {
  const renderComponent = async (
    props: Partial<RenderAnswersThreadItemProps> = {},
    children = html`<div>Thread item content</div>`
  ) => {
    const element = await renderFunctionFixture(
      html`${renderAnswersThreadItem({
        props: {
          title: 'Title',
          isCollapsible: false,
          hideLine: false,
          isExpanded: true,
          ...props,
        },
      })(children)}`
    );

    return {
      element,
      parts: () => ({
        item: element.querySelector('[part="item"]'),
        timeline: element.querySelector('[part="timeline"]'),
        timelineDot: element.querySelector('[part="timeline-dot"]'),
        timelineLine: element.querySelector('[part="timeline-line"]'),
        header: element.querySelector('[part="header"]'),
        title: element.querySelector('[part="title"]'),
        titleButton: element.querySelector('[part="title-button"]'),
        actions: element.querySelector('[part="actions"]'),
        content: element.querySelector('[part="content"]'),
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

  it('should render a title span when not collapsible', async () => {
    const {parts} = await renderComponent({
      isCollapsible: false,
      isExpanded: false,
    });

    expect(parts().title).toBeInTheDocument();
    expect(parts().titleButton).toBeNull();
    expect(parts().content).not.toHaveAttribute('hidden');
  });

  it('should render actions when provided', async () => {
    const {parts} = await renderComponent({
      actions: html`<button>Action</button>`,
    });

    expect(parts().actions).toBeInTheDocument();
    expect(parts().actions).toHaveTextContent('Action');
  });

  it('should toggle expanded state when the title button is clicked', async () => {
    const onToggle = vi.fn();
    const {parts} = await renderComponent({
      isCollapsible: true,
      isExpanded: false,
      onToggle,
    });

    const titleButton = parts().titleButton as HTMLButtonElement;
    titleButton.click();

    expect(onToggle).toHaveBeenCalledWith(true);
    expect(parts().content).not.toHaveAttribute('hidden');
  });

  it('should render nothing for actions when not provided', async () => {
    const {parts} = await renderComponent({actions: nothing});

    expect(parts().actions).toBeNull();
  });
});

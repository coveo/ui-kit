import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import MinusIcon from '../../../images/minus.svg';
import PlusIcon from '../../../images/plus.svg';
import {
  type ExpandableTextProps,
  renderExpandableText,
} from './expandable-text';

describe('#renderExpandableText', () => {
  const renderComponent = async (
    overrides: Partial<ExpandableTextProps> = {}
  ) => {
    const element = await renderFunctionFixture(
      html`${renderExpandableText({
        props: {
          isExpanded: false,
          isTruncated: true,
          isCollapsible: true,
          truncateAfter: '2',
          onToggleExpand: () => {},
          showMoreLabel: 'Show more',
          showLessLabel: 'Show less',
          ...overrides,
        },
      })(html`<div>Test content</div>`)}`
    );

    return {
      element,
      text: element.querySelector('.expandable-text'),
      button: element.querySelector('button'),
      icon: element.querySelector('atomic-icon'),
    };
  };

  it('should render the text with the "expandable-text" part', async () => {
    const {text} = await renderComponent();

    expect(text).toHaveAttribute('part', 'expandable-text');
  });

  it('should apply the correct class on the text based on truncateAfter when isExpanded is false', async () => {
    const {text} = await renderComponent({
      isExpanded: false,
      truncateAfter: '2',
    });

    expect(text).toHaveClass('expandable-text');
    expect(text).toHaveClass('line-clamp-2');
    expect(text).toHaveClass('min-lines-2');
  });

  it('should apply the correct class on the text based on truncateAfter when isExpanded is true', async () => {
    const {text} = await renderComponent({
      isExpanded: true,
      truncateAfter: '3',
    });

    expect(text).toHaveClass('expandable-text');
    expect(text).not.toHaveClass('line-clamp-3');
    expect(text).toHaveClass('min-lines-3');
  });

  it('should render the content inside the expandable text', async () => {
    const {text} = await renderComponent();

    expect(text).toContainHTML('<div>Test content</div>');
  });

  it('should apply the correct class on the button when isTruncated is false and isExpanded is false', async () => {
    const {button} = await renderComponent({
      isTruncated: false,
      isExpanded: false,
    });

    expect(button).toHaveClass('invisible');
    expect(button).not.toHaveClass('hidden');
  });

  it('should apply the correct class on the button when isCollapsible is false and isTruncated is false and isExpanded is true', async () => {
    const {button} = await renderComponent({
      isCollapsible: false,
      isTruncated: false,
      isExpanded: true,
    });

    expect(button).toHaveClass('hidden');
    expect(button).not.toHaveClass('invisible');
  });

  it('should render the correct label on the icon when isExpanded is false', async () => {
    const {button} = await renderComponent({isExpanded: false});

    expect(button).toHaveTextContent('Show more');
  });

  it('should render the correct label on the icon when isExpanded is true', async () => {
    const {button} = await renderComponent({isExpanded: true});

    expect(button).toHaveTextContent('Show less');
  });

  it('should trigger the onToggleExpand function when the button is clicked', async () => {
    const onToggleExpand = vi.fn();
    const {button} = await renderComponent({onToggleExpand});

    await userEvent.click(button!);

    expect(onToggleExpand).toHaveBeenCalled();
  });

  it('should apply the correct icon when isExpanded is false', async () => {
    const {icon} = await renderComponent();

    expect(icon).toHaveAttribute('icon', PlusIcon);
  });

  it('should apply the correct icon when isExpanded is true', async () => {
    const {icon} = await renderComponent({isExpanded: true});

    expect(icon).toHaveAttribute('icon', MinusIcon);
  });
});

import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderRefineModalBody} from './body';

describe('#renderRefineModalBody', () => {
  const renderComponent = async () => {
    const element = await renderFunctionFixture(
      html`${renderRefineModalBody()(html`<div>Test content</div>`)}`
    );

    return {
      asideElement: element.querySelector('aside[part="content"]'),
      content: element.textContent?.trim(),
    };
  };

  it('should render an aside element with part "content"', async () => {
    const {asideElement} = await renderComponent();

    expect(asideElement).toHaveAttribute('part', 'content');
  });

  it('should render an aside element with slot "body"', async () => {
    const {asideElement} = await renderComponent();

    expect(asideElement).toHaveAttribute('slot', 'body');
  });

  it('should render children content', async () => {
    const {content} = await renderComponent();

    expect(content).toContain('Test content');
  });
});

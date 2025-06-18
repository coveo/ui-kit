import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {html} from 'lit';
import {describe, it, expect} from 'vitest';
import {renderRefineModalBody} from './body';

describe('#renderRefineModalBody', () => {
  const renderComponent = async (children = html`<div>Test content</div>`) => {
    const element = await renderFunctionFixture(
      html`${renderRefineModalBody()(children)}`
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
    const testContent = html`<p>Custom test content</p>`;
    const {content} = await renderComponent(testContent);

    expect(content).toContain('Custom test content');
  });
});

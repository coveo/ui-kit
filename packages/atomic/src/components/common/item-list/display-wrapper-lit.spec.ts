import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {html, nothing, TemplateResult} from 'lit';
import {describe, expect, it} from 'vitest';
import {
  DisplayWrapperProps,
  renderListRoot,
  renderListWrapper,
} from './display-wrapper-lit';

describe('renderListWrapper', () => {
  const listWrapperFixture = async (
    props: Partial<DisplayWrapperProps> = {},
    children?: TemplateResult
  ) => {
    return await fixture(
      html`${renderListWrapper({props: {listClasses: '', ...props}})(
        children || nothing
      )}`
    );
  };

  it('should render a list wrapper element in the document', async () => {
    const listWrapper = await listWrapperFixture();

    expect(listWrapper).toBeInTheDocument();
  });

  it('should apply class attribute', async () => {
    const listWrapper = await listWrapperFixture({
      listClasses: 'test-class-1 test-class-2',
    });

    expect(listWrapper).toHaveClass('test-class-1');
    expect(listWrapper).toHaveClass('test-class-2');
  });

  it('should render children', async () => {
    const listWrapper = await listWrapperFixture(
      {},
      html`<div>Test Child 1</div>
        <div>Test Child 2</div>`
    );

    expect(listWrapper.children.length).toBe(2);
    expect(listWrapper.children.item(0)?.textContent).toBe('Test Child 1');
    expect(listWrapper.children.item(1)?.textContent).toBe('Test Child 2');
    expect(listWrapper.children.item(0)).toBeInTheDocument();
    expect(listWrapper.children.item(1)).toBeInTheDocument();
  });
});

describe('renderListRoot', () => {
  const listRootFixture = async (
    props: Partial<DisplayWrapperProps> = {},
    children?: TemplateResult
  ) => {
    return await fixture(
      html`${renderListRoot({
        props: {
          listClasses: '',
          ...props,
        },
      })(children || nothing)}`
    );
  };

  it('should render a list root element in the document', async () => {
    const listRoot = await listRootFixture();

    expect(listRoot).toBeInTheDocument();
  });

  it('should apply class attribute', async () => {
    const listRoot = await listRootFixture({
      listClasses: 'test-class-1 test-class-2',
    });

    expect(listRoot).toHaveClass('test-class-1');
    expect(listRoot).toHaveClass('test-class-2');
  });

  it('should have the correct part', async () => {
    const listRoot = await listRootFixture();

    expect(listRoot.part.value).toBe('result-list');
  });

  it('should render children', async () => {
    const listRoot = await listRootFixture(
      {},
      html`<div>Test Child 1</div>
        <div>Test Child 2</div>`
    );

    expect(listRoot.children.length).toBe(2);
    expect(listRoot.children.item(0)?.textContent).toBe('Test Child 1');
    expect(listRoot.children.item(1)?.textContent).toBe('Test Child 2');
    expect(listRoot.children.item(0)).toBeInTheDocument();
    expect(listRoot.children.item(1)).toBeInTheDocument();
  });
});

import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {html, nothing, TemplateResult} from 'lit';
import {beforeEach, describe, expect, test} from 'vitest';
import {
  DisplayWrapperProps,
  renderListRoot,
  renderListWrapper,
} from './display-wrapper-lit';

describe('renderListWrapper', () => {
  const setupElement = async (
    props: Partial<DisplayWrapperProps>,
    children?: TemplateResult
  ) => {
    return await renderFunctionFixture(
      html`${renderListWrapper({props: {listClasses: props.listClasses || ''}})(
        children || nothing
      )}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render with correct class', async () => {
    const props = {listClasses: 'test-class'};
    const element = await setupElement(props);

    const renderedElements = element.querySelectorAll('*');

    expect(renderedElements.length).toBe(1);
    expect(renderedElements[0]?.classList).toContain('test-class');
  });

  test('should render children', async () => {
    const children = html`<div id="test-child"></div>`;
    const element = await setupElement({}, children);

    const renderedElement = element.querySelectorAll('*')[0];

    const renderedChildren = renderedElement.querySelectorAll('*');

    expect(renderedChildren.length).toBe(1);
    expect(renderedChildren[0]?.id).toBe('test-child');
  });
});

describe('renderListRoot', () => {
  const setupElement = async (
    props: Partial<DisplayWrapperProps>,
    children?: TemplateResult
  ) => {
    return await renderFunctionFixture(
      html`${renderListRoot({
        props: {
          listClasses: props.listClasses || '',
        },
      })(children || nothing)}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render with correct class', async () => {
    const props = {listClasses: 'test-class'};
    const element = await setupElement(props);

    const renderedElements = element.querySelectorAll('*');

    expect(renderedElements.length).toBe(1);
    expect(renderedElements[0]?.classList).toContain('test-class');
  });

  test('should render with correct part', async () => {
    const element = await setupElement({});

    const renderedElement = element.querySelectorAll('*')[0];

    expect(renderedElement?.part.value).toBe('result-list');
  });

  test('should render children', async () => {
    const children = html`<div id="test-child"></div>`;
    const element = await setupElement({}, children);

    const renderedElement = element.querySelectorAll('*')[0];

    const renderedChildren = renderedElement.querySelectorAll('*');

    expect(renderedChildren.length).toBe(1);
    expect(renderedChildren[0]?.id).toBe('test-child');
  });
});

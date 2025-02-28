import {LitElement, render, TemplateResult} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {fixtureWrapper} from './fixture-wrapper';

const _container = {
  lastParentNode: null as HTMLElement | null,
  getLastParentNode() {
    return this.lastParentNode;
  },
};

/**
 * Asynchronously renders a Lit template into a parentNode and waits for the element to update.
 * @param {TemplateResult} template - The Lit template to render.
 * @param {HTMLElement} [parentNode=document.createElement('div')] - The parent node to render the template into.
 * @returns {Promise<T>} A promise that resolves to the rendered LitElement.
 */
export async function fixture<T extends LitElement>(
  template: TemplateResult,
  parentNode: HTMLElement = document.createElement('div')
): Promise<T> {
  const wrapper = fixtureWrapper(parentNode);
  render(template, wrapper);

  _container.lastParentNode = parentNode;

  const element = wrapper.firstElementChild as T;
  await element.updateComplete;

  return element;
}

/**
 * Retrieves a testing-library `within` object for the last parentNode used in the fixture.
 * @returns {ReturnType<typeof within>} The `within` object for the last parentNode.
 * @throws Will throw an error if no parentNode is found.
 */
export const container = () => {
  const lastParentNode = _container.getLastParentNode();
  if (lastParentNode) {
    return within(lastParentNode);
  } else {
    throw 'No parentNode found. Make sure to call fixture() first.';
  }
};

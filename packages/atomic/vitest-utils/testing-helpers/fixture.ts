import {type LitElement, render, type TemplateResult} from 'lit';
import {fixtureWrapper} from './fixture-wrapper';

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

  const element = wrapper.firstElementChild as T;
  await element.updateComplete;

  return element;
}

/**
 * Asynchronously renders a Lit template into a parentNode and waits for the element to update.
 * @param {TemplateResult} template - The Lit template to render.
 * @param {HTMLElement} [parentNode=document.createElement('div')] - The parent node to render the template into.
 * @returns {Promise<T>} A promise that resolves to the rendered HTMl element.
 */
export async function renderFunctionFixture(
  template: TemplateResult,
  parentNode: HTMLElement = document.createElement('div')
) {
  const wrapper = fixtureWrapper(parentNode);
  render(template, wrapper);

  return wrapper;
}

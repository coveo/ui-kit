// @ts-ignore
import quanticQuickviewContentComponent from 'c/c/quanticQuickviewContent';
import { createElement } from 'lwc';
// @ts-ignore
import defaultTemplate from '../quanticQuickviewDefault.html';
// @ts-ignore
import youtubeTemplate from '../quanticQuickviewYoutube.html';


describe('c-quantic-quickview-content', () => {

  it('should render the youtube template if the content is a youtube video', () => {
    const element = createElement('c-quantic-quickview-content', {
      is: quanticQuickviewContentComponent,
    });
    // add condition to trigger the expected template

    document.body.appendChild(element);

    // get the rendered output from the component's shadow root
    const shadowRoot = element.shadowRoot;
    const actualTemplate = shadowRoot.querySelector(youtubeTemplate);

    expect(actualTemplate).not.toBeNull();
  });

  it('should render the default template if the content is any other type than a youtube video', () => {
    const element = createElement('c-quantic-quickview-content');

    document.body.appendChild(element);
    // get the rendered output from the component's shadow root
    const shadowRoot = element.shadowRoot;
    const actualTemplate = shadowRoot.querySelector(defaultTemplate);

    expect(actualTemplate).not.toBeNull();
  });
});
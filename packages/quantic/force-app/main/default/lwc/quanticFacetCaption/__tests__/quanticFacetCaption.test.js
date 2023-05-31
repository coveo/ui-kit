// @ts-ignore
import {createElement} from 'lwc';
import QuanticFacetCaption from '../quanticFacetCaption';

function createTestComponent(options) {
  const element = createElement('c-quantic-facet-caption', {
    is: QuanticFacetCaption,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

describe('c-quantic-facet-caption', () => {
  it('should expose captions through the `captions` property', () => {
    const value = 'the-facet-value';
    const caption = 'The custom caption';
    const element = createTestComponent({value, caption});

    const captions = element.captions;

    expect(captions[value]).toBe(caption);
  });
});

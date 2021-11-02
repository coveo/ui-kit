import {getSvg} from './icon-utils';
import {sanitize} from 'dompurify';

function getSortedClone(element: Element) {
  const sortedAttributes = Array.from(element.attributes).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const clone = document.createElement(element.tagName.toLowerCase());
  sortedAttributes.forEach((attr) => clone.setAttribute(attr.name, attr.value));
  Array.from(element.children).forEach((child) =>
    clone.appendChild(getSortedClone(child))
  );
  return clone;
}

export function assertRendersIcon(
  selector: () => Cypress.Chainable<JQuery<HTMLElement>>,
  iconName: string
) {
  it(`should render ${iconName}.svg`, () => {
    getSvg(iconName).then((expectedSvg) =>
      selector().should(([actualSvgElement]) =>
        expect(getSortedClone(actualSvgElement).outerHTML).to.eq(
          getSortedClone(
            sanitize(expectedSvg, {
              USE_PROFILES: {svg: true, svgFilters: true},
              RETURN_DOM_FRAGMENT: true,
            }).querySelector('svg')!
          ).outerHTML
        )
      )
    );
  });
}

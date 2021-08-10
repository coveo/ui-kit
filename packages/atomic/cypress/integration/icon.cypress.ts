import {generateComponentHTML} from '../fixtures/test-fixture';
import {setUpPage} from '../utils/setupComponent';
import {IconSelectors} from './icon-selectors';

function getSvg(fileName: string) {
  const file = cy.readFile(
    `./src/components/atomic-icon/assets/${fileName}.svg`
  );
  return file;
}

function shouldRenderIcon(icon: string) {
  cy.get(IconSelectors.title).should('have.text', icon);
}

describe('Icon Test Suites', () => {
  function setupIcon(icon: string) {
    setUpPage(generateComponentHTML('atomic-icon', {icon}).outerHTML);
  }

  it('should render an icon from the asset directory', () => {
    setupIcon('assets://attachment');
    shouldRenderIcon('attachment');
  });

  it('should render an icon from a SVG string', () => {
    getSvg('custom').then((icon) => {
      setupIcon(icon);
      shouldRenderIcon('custom');
    });
  });

  it('should render an icon from a URL', () => {
    getSvg('mail').then((icon) => {
      const url = 'https://some-website-with-icons.com/my-icon.svg';
      cy.intercept(url, {
        body: icon,
      });
      setupIcon(url);
      shouldRenderIcon('mail');
    });
  });

  it('should not be vulnerable to XSS injections in an SVG string', () => {
    setupIcon(
      `<img src="" onerror="document.querySelector('${IconSelectors.icon}').setAttribute('xss', 'true');"/>`
    );
    cy.get(IconSelectors.icon).should('not.have.attr', 'xss');
  });

  it('should not be vulnerable to XSS injections from a URL', () => {
    const url = 'https://some-website-with-icons.com/my-icon.svg';
    cy.intercept(url, {
      body: `<img src="" onerror="document.querySelector('${IconSelectors.icon}').setAttribute('xss', 'true');"/>`,
    });
    setupIcon(url);
    cy.get(IconSelectors.icon).should('not.have.attr', 'xss');
  });
});

import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import * as IconAssertions from './icon-assertions';
import {IconSelectors} from './icon-selectors';
import {getSvg} from './icon-utils';

describe('Icon Test Suites', () => {
  function setupIcon(icon: string) {
    new TestFixture()
      .withElement(generateComponentHTML('atomic-icon', {icon}))
      .init();
  }

  describe('with assets://attachment', () => {
    beforeEach(() => {
      setupIcon('assets://attachment');
    });

    IconAssertions.assertRendersIcon(
      () => cy.get(IconSelectors.svg),
      'attachment'
    );
  });

  describe('with the contents of the custom.svg icon', () => {
    beforeEach(() => {
      getSvg('custom').then((icon) => {
        setupIcon(icon);
      });
    });

    IconAssertions.assertRendersIcon(() => cy.get(IconSelectors.svg), 'custom');
  });

  describe('with a url to email.svg', () => {
    beforeEach(() => {
      getSvg('email').then((icon) => {
        const url = 'https://some-website-with-icons.com/my-icon.svg';
        cy.intercept(url, {
          body: icon,
        });
        setupIcon(url);
      });
    });

    IconAssertions.assertRendersIcon(() => cy.get(IconSelectors.svg), 'email');
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

  describe('when the icon is invalid', () => {
    beforeEach(() => {
      setupIcon('http://localhost:1');
    });

    CommonAssertions.assertRemovesComponent(() => cy.get(IconSelectors.icon));
    CommonAssertions.assertConsoleError();
  });
});

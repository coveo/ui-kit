import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {ComponentErrorSelectors} from './component-error-selectors';
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
    CommonAssertions.assertConsoleWarning(false);
  });

  describe('with the contents of the custom.svg icon', () => {
    beforeEach(() => {
      getSvg('custom').then((icon) => {
        setupIcon(icon);
      });
    });

    IconAssertions.assertRendersIcon(() => cy.get(IconSelectors.svg), 'custom');
    CommonAssertions.assertConsoleWarning(false);
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
    CommonAssertions.assertConsoleWarning(false);
  });

  describe('when the icon cannot be fetched', () => {
    const iconDoesNotExistWith404ErrorMessage = (url: string) =>
      `Could not fetch icon from ${url}, got status code 404 (Not Found).`;
    const iconDoesNotExistThrowErrorMessage = (url: string) =>
      `Could not fetch icon from ${url}, got an error.`;

    describe('with a url that returns a 404', () => {
      const url = 'https://hello.invalid/my-icon.svg';
      beforeEach(() => {
        cy.intercept(url, {statusCode: 404});
        setupIcon(url);
      });

      CommonAssertions.assertConsoleErrorMessage(
        iconDoesNotExistWith404ErrorMessage(url)
      );
    });

    describe('with an asset path', () => {
      const asset = 'assets://some-icon-that-does-not-exist';
      const url = asset.replace('assets://', '/build/assets/') + '.svg';

      describe('with an asset path that returns a 404', () => {
        beforeEach(() => {
          cy.intercept(url, {statusCode: 404});
          setupIcon(asset);
        });

        CommonAssertions.assertConsoleErrorMessage(
          iconDoesNotExistWith404ErrorMessage(url)
        );
      });

      describe('with an asset path that throws an error', () => {
        beforeEach(() => {
          cy.intercept(url, {forceNetworkError: true});
          setupIcon(asset);
        });

        CommonAssertions.assertConsoleErrorMessage(
          iconDoesNotExistThrowErrorMessage(url)
        );
      });
    });
  });

  describe('with the contents of an inline non svg icon', () => {
    beforeEach(() => {
      getSvg('custom').then(() => {
        setupIcon('<img />');
      });
    });

    CommonAssertions.assertConsoleWarningMessage(
      'The inline "icon" prop is not an svg element. You may encounter rendering issues.'
    );
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

    it('should display an error component', () => {
      cy.get(IconSelectors.icon)
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
    CommonAssertions.assertConsoleError();
  });
});

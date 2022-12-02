import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {interceptSearch} from '../../../page-objects/search';
import {InsightInterfaceExpectations as InsightInterfaceExpect} from '../../../page-objects/use-case';
import {CopyToClipboardActions as Actions} from './copy-to-clipboard-actions';
import {CopyToClipboardExpectations as Expect} from './copy-to-clipboard-expectations';

interface copyToClipboardOptions {
  label: string;
  successLabel: string;
  textTemplate: string;
}

const testResult = {
  clickUri: 'https://test.com',
  Excerpt: 'Test excerpt',
  title: 'Test result',
  raw: {
    urihash: 'Test uri hash',
    objecttype: 'Test',
    source: 'Test source',
    date: 1669504751000,
  },
};

const defaultLabel = 'Copy';
const defaultSuccessLabel = 'Copied!';
const customLabel = 'Copy to clipboard';
const customSuccessLabel = 'Copied to clipboard!';
const customTextTemplate = '${raw.source} : ${clickUri}';

// access to the clipboard reliably works in Electron browser
// in other browsers, there are popups asking for permission
// thus we should only run these tests in Electron
describe('quantic-result-copy-to-clipboard', {browser: 'electron'}, () => {
  const pageUrl = 's/quantic-result-copy-to-clipboard';

  function visitCopyToClipboard(options: Partial<copyToClipboardOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    InsightInterfaceExpect.isInitialized();
    performSearch();
  }

  describe('with the default options', () => {
    it('should correctly display the copy to clipboard button', () => {
      visitCopyToClipboard({});

      Expect.displayCopyToClipboardButton(true);
      Expect.displayCopyToClipboardTooltip(defaultLabel);
    });

    it('should correctly copy the result to clipboard', () => {
      visitCopyToClipboard({});

      Expect.displayCopyToClipboardButton(true);
      Actions.clickCopyToClipboardButton();
      Expect.displayCopyToClipboardTooltip(defaultSuccessLabel);
      Expect.logCopyToClipboard(testResult);

      cy.window()
        .its('navigator.clipboard')
        .invoke('readText')
        .should('equal', `${testResult.title}\n${testResult.clickUri}`);
    });
  });

  describe('with custom options', () => {
    it('should correctly display the copy to clipboard button', () => {
      visitCopyToClipboard({
        label: customLabel,
      });

      Expect.displayCopyToClipboardButton(true);
      Expect.displayCopyToClipboardTooltip(customLabel);
    });

    it('should correctly copy the result to clipboard', () => {
      visitCopyToClipboard({
        successLabel: customSuccessLabel,
        textTemplate: customTextTemplate,
      });

      Expect.displayCopyToClipboardButton(true);
      Actions.clickCopyToClipboardButton();
      Expect.displayCopyToClipboardTooltip(customSuccessLabel);
      Expect.logCopyToClipboard(testResult);

      cy.window()
        .its('navigator.clipboard')
        .invoke('readText')
        .should('equal', `${testResult.raw.source} : ${testResult.clickUri}`);
    });
  });
});

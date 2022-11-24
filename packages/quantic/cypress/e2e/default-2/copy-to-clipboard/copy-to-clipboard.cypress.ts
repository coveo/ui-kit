import {configure} from '../../../page-objects/configurator';
import {mockSearchWithResults} from '../../../page-objects/search';
import {CopyToClipboardActions as Actions} from './copy-to-clipboard-actions';
import {CopyToClipboardExpectations as Expect} from './copy-to-clipboard-expectations';

interface copyToClipboardOptions {
  label: string;
  successLabel: number;
}

const defaultLabel = 'Copy';
const defaultSuccessLabel = 'Copied!';

describe('quantic-copy-to-clipboard', {browser: 'electron'}, () => {
  const pageUrl = 's/quantic-result-copy-to-clipboard';

  function visitcopyToClipboard(options: Partial<copyToClipboardOptions>) {
    cy.visit(pageUrl);
    mockSearchWithResults();
    configure(options);
  }

  describe('with the default options', () => {
    it('should correctly display the copy to clipboard button', () => {
      visitcopyToClipboard({});

      Expect.displayCopyToClipboardButton(true);
      Expect.displayCopyToClipboardTooltip(defaultLabel);
    });

    it('should correctly copy the result to clipboard', () => {
      visitcopyToClipboard({});

      Expect.displayCopyToClipboardButton(true);
      Actions.clickCopyToClipboardButton();
      Expect.displayCopyToClipboardTooltip(defaultSuccessLabel);

      cy.window()
        .its('navigator.clipboard')
        .invoke('readText')
        .should('equal', 'Result\n${clickUri}');
    });
  });
});

import {InterceptAliases} from '../../../page-objects/search';
import {
  CopyToClipboardSelector,
  CopyToClipboardSelectors,
} from './copy-to-clipboard-selectors';

function copyToClipboardExpectations(selector: CopyToClipboardSelector) {
  return {
    displayCopyToClipboardButton: (display: boolean) => {
      selector
        .copyToClipboardButton()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the copy to clipboard button');
    },

    displayCopyToClipboardTooltip: (label: string) => {
      selector
        .copyToClipboardTooltip()
        .contains(label)
        .log('should display the copy to clipboard tooltip');
    },

    logCopyToClipboard: (result: {
      title: string;
      clickUri: string;
      raw: {urihash: string};
    }) => {
      cy.wait(InterceptAliases.UA.CopyToClipboard)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('documentTitle', result.title);
          expect(analyticsBody).to.have.property(
            'documentUri',
            result.clickUri
          );
          expect(analyticsBody).to.have.property(
            'documentUrl',
            result.clickUri
          );
          expect(analyticsBody).to.have.property(
            'documentUriHash',
            result.raw.urihash
          );
          expect(analyticsBody).to.have.property('documentPosition', 1);
        })
        .logDetail("should log the 'copyToClipboard' UA event");
    },
  };
}

export const CopyToClipboardExpectations = {
  ...copyToClipboardExpectations(CopyToClipboardSelectors),
};

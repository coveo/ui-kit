import {
  CopyToClipboardSelector,
  CopyToClipboardSelectors,
} from './copy-to-clipboard-selectors';

function copyToClipboardActions(selector: CopyToClipboardSelector) {
  return {
    clickCopyToClipboardButton: () =>
      selector
        .copyToClipboardButton()
        .click()
        .logAction('When clicking on the copy to clipboard button'),
  };
}

export const CopyToClipboardActions = {
  ...copyToClipboardActions(CopyToClipboardSelectors),
};

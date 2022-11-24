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
        .log('should display the copy to clipboard button');
    },
  };
}

export const CopyToClipboardExpectations = {
  ...copyToClipboardExpectations(CopyToClipboardSelectors),
};

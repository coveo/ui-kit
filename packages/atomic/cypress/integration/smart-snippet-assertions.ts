import {should} from './common-assertions';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

export function assertLikeButtonChecked(checked: boolean) {
  it(`${should(checked)} check the like button`, () => {
    SmartSnippetSelectors.feedbackLikeButton()
      .find('input')
      .should(checked ? 'be.checked' : 'not.be.checked');
  });
}

export function assertDislikeButtonChecked(checked: boolean) {
  it(`${should(checked)} check the dislike button`, () => {
    SmartSnippetSelectors.feedbackDislikeButton()
      .find('input')
      .should(checked ? 'be.checked' : 'not.be.checked');
  });
}

export function assertThankYouBanner(display: boolean) {
  it(`${should(display)} display the like button`, () => {
    SmartSnippetSelectors.feedbackThankYou().should(
      display ? 'be.visible' : 'be.hidden'
    );
  });
}

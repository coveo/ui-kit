import {should} from './common-assertions';
import {PagerSelectors} from './pager-selectors';

export function assertFocusActivePage() {
  it('should focus on the active page', () => {
    PagerSelectors.buttonActivePage().should('be.focused');
  });
}

export function assertRenderPager(numberOfPages: number) {
  it('should render the pager', () => {
    PagerSelectors.pager().should('be.visible');
    PagerSelectors.pageButton(numberOfPages).should('be.visible');
    PagerSelectors.buttonPrevious().should('be.visible');
    PagerSelectors.buttonNext().should('be.visible');
    PagerSelectors.pageButtons().its('length').should('eq', numberOfPages);
  });
}

export function assertPagerSelected(pageNumber: string, selected: boolean) {
  it(`button ${pageNumber} ${should(selected)} be selected`, () => {
    const isContain = selected ? 'contain' : 'not.contain';
    PagerSelectors.pageButton(pageNumber)
      .should('have.attr', 'part')
      .and(isContain, 'active-page-button');
  });
}

export function assertPageInHash(page: number) {
  const firstResult = (page - 1) * 10;
  const shouldInclude = firstResult !== 0;
  const expectedHash = shouldInclude
    ? `#firstResult=${firstResult}`
    : '#firstResult';

  it(`${should(shouldInclude)} include ${expectedHash} in the hash`, () => {
    cy.url().should(shouldInclude ? 'include' : 'not.include', expectedHash);
  });
}

export function assertLogPagerNext(pageNumber: number) {
  it('should log pagerNext', () => {
    cy.expectCustomEvent('getMoreResults', 'pagerNext').should(
      (analyticsBody) => {
        expect(analyticsBody.customData).to.have.property(
          'pagerNumber',
          pageNumber
        );
      }
    );
  });
}

export function assertLogPagerPrevious(pageNumber: number) {
  it('should log pagerPrevious', () => {
    cy.expectCustomEvent('getMoreResults', 'pagerPrevious').should(
      (analyticsBody) => {
        expect(analyticsBody.customData).to.have.property(
          'pagerNumber',
          pageNumber
        );
      }
    );
  });
}

export function assertLogPagerNumber(pageNumber: number) {
  it('should log pagerNumber', () => {
    cy.expectCustomEvent('getMoreResults', 'pagerNumber').should(
      (analyticsBody) => {
        expect(analyticsBody.customData).to.have.property(
          'pagerNumber',
          pageNumber
        );
      }
    );
  });
}

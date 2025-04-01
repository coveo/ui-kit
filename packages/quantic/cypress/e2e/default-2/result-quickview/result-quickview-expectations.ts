import {InterceptAliases} from '../../../page-objects/search';
import {getAnalyticsBodyFromInterception} from '../../common-expectations';
import {should} from '../../common-selectors';
import {EventExpectations} from '../../event-expectations';
import {
  ResultQuickviewSelector,
  ResultQuickviewSelectors,
} from './result-quickview-selectors';

export type PreviewVariantType = 'brand' | 'outline-brand' | 'result-action';

function resultQuickviewExpectations(selector: ResultQuickviewSelector) {
  return {
    displayButtonPreview: (display: boolean) => {
      selector
        .buttonPreview()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the button preview`);
    },
    displayCorrectPreviewButtonVariant: (variant: PreviewVariantType) => {
      const expectedCssVariantClasses = {
        brand: 'slds-button_brand',
        'outline-brand': 'slds-button_outline-brand',
        'result-action': 'slds-button_icon-border-filled',
      };
      selector
        .buttonPreview()
        .should('have.class', expectedCssVariantClasses[`${variant}`])
        .log(
          `the preview button should be displayed in the ${variant} variant`
        );
    },
    displayButtonPreviewIcon: (display: boolean) => {
      selector
        .buttonPreviewIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the icon in button preview`);
    },
    buttonPreviewIconContains: (iconName: string) => {
      selector
        .buttonPreviewIcon()
        .find('svg')
        .invoke('attr', 'data-key')
        .should('contain', iconName)
        .logDetail(`the icon in button preview should contain "${iconName}"`);
    },
    buttonPreviewIsDisabled: (disabled: boolean) => {
      selector
        .buttonPreview()
        .invoke('attr', 'disabled')
        .should(disabled ? 'exist' : 'not.exist')
        .logDetail(`The button preview ${should(disabled)} be disabled`);
    },
    displaySectionPreview: (display: boolean) => {
      selector
        .sectionPreview()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the section preview`);
    },
    displayTitle: (display: boolean) => {
      selector
        .title()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the title`);
    },
    displayDate: (display: boolean) => {
      selector
        .resultDate()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the result date`);
    },
    buttonPreviewContains: (label: string) => {
      selector
        .buttonPreview()
        .contains(label)
        .logDetail(`The button preview should contain "${label}"`);
    },
    displayContentContainer: (display: boolean) => {
      selector
        .contentContainer()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the content`);
    },
    displaySpinner: (display: boolean) => {
      selector
        .spinner()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the spinner`);
    },
    noAlertShown: () => {
      const spy = cy.spy(window, 'alert');
      expect(spy).to.not.be.called;
    },
    logDocumentQuickview: (title: string) => {
      cy.wait(InterceptAliases.UA.DocumentQuickview)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromInterception(interception);
          expect(analyticsBody).to.have.property(
            'actionCause',
            'documentQuickview'
          );
          expect(analyticsBody).to.have.property('documentTitle', title);
        })
        .logDetail('should log the "documentQuickview" UA event');
    },
    displayTooltip: (label: string) => {
      selector
        .tooltip()
        .contains(label)
        .log('should display the correct tooltip');
    },
  };
}

export const ResultQuickviewExpectations = {
  ...resultQuickviewExpectations(ResultQuickviewSelectors),
  events: {
    ...EventExpectations,
  },
};

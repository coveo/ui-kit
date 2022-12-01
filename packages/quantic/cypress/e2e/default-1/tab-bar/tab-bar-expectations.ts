import {should} from '../../common-selectors';
import {TabBarSelector, TabBarSelectors} from './tab-bar-selectors';

function tabBarExpectations(selector: TabBarSelector) {
  return {
    displayTabs(display: boolean) {
      selector
        .allTabs()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the tabs`);
    },

    displayedTabsEqual(values: string[]) {
      selector
        .allTabs()
        .then((elements) => {
          const captions = Cypress.$.makeArray(elements)
            .filter((element) => element.style.visibility === 'visible')
            .map((element) => {
              return element.innerText;
            });
          expect(captions).to.deep.equal(values);
        })
        .logDetail('should display the correct tabs in the correct order');
    },

    tabsInDropdownEqual(values: string[]) {
      selector
        .allDropdownOptions()
        .then((elements) => {
          const captions = Cypress.$.makeArray(elements).map((element) => {
            return element.innerText;
          });
          expect(captions).to.deep.equal(values);
        })
        .logDetail(
          'should display the correct tabs in the correct order in the dropdown list'
        );
    },

    activeTabContains(value: string) {
      selector
        .activeTab()
        .should('have.length', 1)
        .should('contain', value)
        .logDetail(`the active tab should be the ${value} tab`);
    },

    displayMoreButton(display: boolean) {
      selector
        .moreButton()
        .should('exist')
        .should('have.css', 'display', display ? 'block' : 'none')
        .logDetail(`${should(display)} display the more button`);
    },

    displayDropdown(display: boolean) {
      selector
        .dropdownTrigger()
        .should('exist')
        .should(display ? 'have.class' : 'not.have.class', 'slds-is-open');
      selector
        .dropdown()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the dropdown`);
    },

    displayMoreButtonLabel(text: string) {
      selector
        .moreButtonLabel()
        .should('eq', text)
        .logDetail(`should display ${text} as the more button label`);
    },

    displayMoreButtonIcon(display: boolean) {
      selector
        .moreButtonIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the more button icon`);
    },

    displayWithLightTheme(lightThemeEnabled: boolean) {
      selector
        .tabBarContainer()
        .should(
          lightThemeEnabled ? 'not.have.class' : 'have.class',
          'slds-theme_shade'
        )
        .logDetail(
          `${should(
            lightThemeEnabled
          )} display the component with the light theme styles`
        );
    },
  };
}

export const TabBarExpectations = {
  ...tabBarExpectations(TabBarSelectors),
};

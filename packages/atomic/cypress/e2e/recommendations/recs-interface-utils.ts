import {RecsInterface} from '../../fixtures/test-recs-fixture';

export function getRecsInterface(cb: (searchInterface: RecsInterface) => void) {
  return cy.get('atomic-recs-interface').then(($el) => {
    cb($el.get(0) as RecsInterface);
  });
}

export function setLanguage(lang: string) {
  return getRecsInterface((recsInterface) => {
    recsInterface.language = lang;
  });
}

export function getRecommendations() {
  return getRecsInterface((recsInterface) => {
    recsInterface.getRecommendations();
  });
}

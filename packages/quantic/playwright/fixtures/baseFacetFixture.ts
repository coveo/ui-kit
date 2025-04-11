import {BaseFacetObject} from '../page-object/baseFacetObject';
import {ConfigurationObject} from '../page-object/configurationObject';
import {quanticBase} from './baseFixture';

type QuanticBaseFacetE2EFixtures = {
  baseFacet: BaseFacetObject;
  urlHash?: string;
  preventMockFacetResponse?: boolean;
};

export const facetBase = quanticBase.extend<QuanticBaseFacetE2EFixtures>({
  urlHash: '',
  preventMockFacetResponse: false,
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
});

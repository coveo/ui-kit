import {BaseFacetObject} from '../page-object/baseFacetObject';
import {ConfigurationObject} from '../page-object/configurationObject';
import {quanticBase} from './baseFixture';

type QuanticBaseFacetE2EFixtures = {
  baseFacet: BaseFacetObject;
  urlHash?: string;
  facetResponseMock?: Array<Record<string, unknown>>;
};

export const facetBase = quanticBase.extend<QuanticBaseFacetE2EFixtures>({
  urlHash: '',
  configuration: async ({page}, use) => {
    await use(new ConfigurationObject(page));
  },
});

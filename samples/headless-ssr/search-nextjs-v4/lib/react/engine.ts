import {defineSearchEngine} from '@coveo/headless-react/ssr-next';
import {config} from '../search-engine-config';

export const {
  searchEngineDefinition,
  standaloneEngineDefinition,
  useHydration,
  controllers: {
    useAuthorFacet,
    useParameterManager,
    useResultList,
    useSearchBox,
    useStandaloneSearchBox,
    useTabAll,
    useTabCountries,
    useTabVideos,
  },
} = defineSearchEngine(config);

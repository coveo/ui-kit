import {
  AtomicCommerceInterface,
  AtomicCommerceLayout,
  AtomicCommerceRecommendationInterface,
  AtomicCommerceRecommendationList,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
  AtomicLayoutSection,
} from '@coveo/atomic-react/commerce';
import {useMemo} from 'react';
import {buildEngine} from '../engine';
import {ProductTemplate} from './ProductTemplate';

export const HomePage = () => {
  const engine = useMemo(() => buildEngine('https://sports.barca.group'), []);

  return (
    <div className="home">
      {/* Standalone search box: submitting a query redirects to the search page. */}
      <section className="home-hero">
        <AtomicCommerceInterface
          engine={engine}
          type="search"
          languageAssetsPath="/lang"
        >
          <AtomicLayoutSection section="search">
            <AtomicCommerceSearchBox redirectionUrl="/search">
              <AtomicCommerceSearchBoxRecentQueries />
              <AtomicCommerceSearchBoxQuerySuggestions />
            </AtomicCommerceSearchBox>
          </AtomicLayoutSection>
        </AtomicCommerceInterface>
      </section>

      <section className="home-recs">
        <AtomicCommerceRecommendationInterface
          engine={engine}
          languageAssetsPath="/lang"
        >
          <AtomicCommerceLayout>
            <AtomicLayoutSection section="main">
              <AtomicCommerceRecommendationList
                slotId="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
                productsPerPage={4}
                display="grid"
                imageSize="small"
                template={ProductTemplate}
              />
              <AtomicCommerceRecommendationList
                slotId="d73afbd2-8521-4ee6-a9b8-31f064721e73"
                productsPerPage={4}
                display="grid"
                imageSize="small"
                template={ProductTemplate}
              />
            </AtomicLayoutSection>
          </AtomicCommerceLayout>
        </AtomicCommerceRecommendationInterface>
      </section>
    </div>
  );
};

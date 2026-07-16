import {
  AtomicBreadbox,
  AtomicCategoryFacet,
  AtomicFacet,
  AtomicFacetManager,
  AtomicLayoutSection,
  AtomicPager,
  AtomicQuerySummary,
  AtomicResultDate,
  AtomicResultLink,
  AtomicResultList,
  AtomicResultPrintableUri,
  AtomicResultText,
  AtomicSearchBox,
  AtomicSearchBoxInstantResults,
  AtomicSearchBoxQuerySuggestions,
  AtomicSearchBoxRecentQueries,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
} from '@coveo/atomic-react';
import type {CSSProperties} from 'react';
import {engine} from './engine';

// Template for the instant-results dropdown (just the title link).
const InstantResultTemplate = () => <AtomicResultLink />;

// Atomic-React renders each result template inside the `atomic-result` shadow
// DOM, so global stylesheet classes don't reach it. The layout is applied with
// inline styles (which apply directly on the elements) plus the sample's CSS
// custom properties, which do inherit across the shadow boundary.
const resultItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  padding: '0.4rem 0',
};

const resultCategoryStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--sample-accent)',
};

const resultTitleStyle: CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 600,
};

const resultExcerptStyle: CSSProperties = {
  color: 'var(--sample-text-muted)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
};

const resultFooterStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  fontSize: '0.8rem',
  color: 'var(--sample-text-muted)',
};

const resultTemplate = () => (
  <div style={resultItemStyle}>
    <AtomicResultText field="article_type" style={resultCategoryStyle} />
    <AtomicResultLink style={resultTitleStyle} />
    <AtomicResultText field="excerpt" style={resultExcerptStyle} />
    <div style={resultFooterStyle}>
      <AtomicResultPrintableUri maxNumberOfParts={3} />
      <AtomicResultDate style={{flexShrink: 0}} />
    </div>
  </div>
);

export const App = () => (
  <div className="app">
    <header className="app-header">
      <div className="brand">
        <img src="/coveo-logo.svg" alt="Coveo" width={119} height={30} />
        <h1>Atomic Search + React</h1>
      </div>
    </header>

    <AtomicSearchInterface engine={engine}>
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox>
            <AtomicSearchBoxRecentQueries />
            <AtomicSearchBoxQuerySuggestions />
            <AtomicSearchBoxInstantResults
              imageSize="small"
              maxResultsPerQuery={4}
              template={InstantResultTemplate}
            />
          </AtomicSearchBox>
        </AtomicLayoutSection>

        <AtomicLayoutSection section="facets">
          <AtomicFacetManager>
            <AtomicCategoryFacet
              field="ec_category"
              label="Category"
              delimitingCharacter="|"
            />
            <AtomicFacet field="article_type" label="Article type" />
            <AtomicFacet field="robot_series" label="Robot series" />
            <AtomicFacet field="difficulty_level" label="Difficulty" />
            <AtomicFacet field="author" label="Author" />
          </AtomicFacetManager>
        </AtomicLayoutSection>

        <AtomicLayoutSection section="main">
          <AtomicLayoutSection section="status">
            <AtomicBreadbox />
            <AtomicQuerySummary />
            <AtomicSortDropdown>
              <AtomicSortExpression label="Relevance" expression="relevancy" />
              <AtomicSortExpression
                label="Newest"
                expression="date descending"
              />
              <AtomicSortExpression
                label="Oldest"
                expression="date ascending"
              />
            </AtomicSortDropdown>
          </AtomicLayoutSection>

          <AtomicLayoutSection section="results">
            <AtomicResultList display="list" template={resultTemplate} />
          </AtomicLayoutSection>

          <AtomicLayoutSection section="pagination">
            <AtomicPager />
          </AtomicLayoutSection>
        </AtomicLayoutSection>
      </AtomicSearchLayout>
    </AtomicSearchInterface>
  </div>
);

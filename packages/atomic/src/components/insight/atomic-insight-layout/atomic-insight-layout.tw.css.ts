import {css} from 'lit';

const styles = css`
  atomic-layout-section[section="search"] {
    grid-area: atomic-section-search;
  }

  atomic-layout-section[section="facets"] {
    grid-area: atomic-section-facets;
  }

  atomic-layout-section[section="results"] {
    grid-area: atomic-section-results;
  }

  atomic-insight-layout {
    width: 100%;
    height: 100%;
    display: none;
  }
`;

export default styles;

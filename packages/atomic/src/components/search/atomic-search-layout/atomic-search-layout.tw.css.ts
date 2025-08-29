import {css} from 'lit';

const styles = css`
.atomic-modal-opened {
  overflow-y: hidden;
}

atomic-layout-section[section="search"] {
  grid-area: atomic-section-search;
}

atomic-layout-section[section="facets"] {
  grid-area: atomic-section-facets;
}

atomic-layout-section[section="main"] {
  grid-area: atomic-section-main;
}

atomic-layout-section[section="status"] {
  grid-area: atomic-section-status;
}

atomic-layout-section[section="pagination"] {
  grid-area: atomic-section-pagination;
}

/**
 * @prop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @prop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @prop --atomic-layout-search-box-left-suggestions-width: When displaying a double list, the width of the left list.
 */
atomic-search-layout {
  width: 100%;
  height: 100%;
  display: none;
  grid-template-areas:
    ". atomic-section-search ."
    ". atomic-section-main .";
  grid-template-columns: var(--atomic-layout-spacing-x) minmax(0, 1fr) var(
      --atomic-layout-spacing-x
    );

  atomic-layout-section[section="search"] {
    margin: var(--atomic-layout-spacing-y) 0;
    max-width: var(--atomic-layout-max-search-box-input-width, 678px);
    width: 100%;
    justify-self: center;

    /* Only affects desktop */
    atomic-search-box {
      &::part(suggestions-double-list) {
        width: 125%;
        max-width: var(
          --atomic-layout-max-search-box-double-suggestions-width,
          800px
        );
      }

      &::part(suggestions-left) {
        flex-basis: var(--atomic-layout-search-box-left-suggestions-width, 30%);
      }

      &::part(suggestions-right) {
        flex-basis: calc(
          100% -
          var(--atomic-layout-search-box-left-suggestions-width, 30%)
        );
      }
    }
  }

  atomic-layout-section[section="facets"] {
    display: none;

    & * {
      margin-bottom: var(--atomic-layout-spacing-y);
    }
  }

  atomic-layout-section[section="main"] {
    margin-bottom: var(--atomic-layout-spacing-y);
  }

  atomic-layout-section[section="horizontal-facets"] {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: var(--atomic-layout-spacing-y);
    row-gap: 0.5rem;

    & > * {
      max-width: 100%;
    }

    & > atomic-segmented-facet,
    & > atomic-popover {
      margin-right: 0.5rem;
    }

    & > atomic-popover {
      display: none;
    }
  }

  atomic-layout-section[section="status"] {
    display: grid;
    justify-content: space-between;
    grid-template-areas:
      "atomic-breadbox       atomic-breadbox"
      "atomic-query-summary  atomic-sort"
      "atomic-did-you-mean   atomic-did-you-mean"
      "atomic-notifications  atomic-notifications";

    & > * {
      margin-bottom: var(--atomic-layout-spacing-y);
    }

    atomic-breadbox {
      grid-area: atomic-breadbox;
    }

    atomic-query-summary {
      grid-area: atomic-query-summary;
      align-self: center;
      overflow: hidden;
    }

    atomic-sort-dropdown {
      grid-area: atomic-sort;
      justify-self: end;
    }

    atomic-refine-toggle {
      grid-area: atomic-sort;
    }

    atomic-did-you-mean {
      grid-area: atomic-did-you-mean;
    }

    atomic-notifications {
      grid-area: atomic-notifications;
    }
  }

  atomic-layout-section[section="results"] {
    atomic-smart-snippet {
      margin-bottom: 1.5rem;
    }

    atomic-smart-snippet-suggestions {
      margin-bottom: 1.5rem;
    }
  }

  atomic-layout-section[section="pagination"] {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    atomic-load-more-results {
      width: 100%;
    }

    &:has(:only-child) {
      justify-content: center;
    }

    & > * {
      margin-top: var(--atomic-layout-spacing-y);
    }

    /* Approx. width of pager & results per page */
    @media only screen and (min-width: 50rem) {
      flex-direction: row;
    }
  }
}`;

export default styles;

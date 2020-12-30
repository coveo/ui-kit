import './App.css';

function App() {
  return (
    <div className="container-xl">
      <atomic-search-box search-interface-id="search">
        <span slot="submit-button">Go!</span>
      </atomic-search-box>
      <atomic-search-interface id="search" sample>
        <div className="row justify-content-center">
          <atomic-tab className="col-auto" expression="">
            All Files
          </atomic-tab>
          <atomic-tab className="col-auto" expression='@author *= "BBC News"'>
            BBC News
          </atomic-tab>
        </div>
        <atomic-context-provider context='{"test":"value","test2":"value2"}'></atomic-context-provider>
        <div className="row justify-content-center my-5">
          <div className="col-8"></div>
        </div>
        <div className="row">
          <div className="col-4">
            <atomic-facet-manager>
              <atomic-facet field="author" label="Authors"></atomic-facet>
              <atomic-numeric-facet
                field="size"
                label="File sizes"
              ></atomic-numeric-facet>
              <atomic-date-facet
                field="created"
                label="Created"
              ></atomic-date-facet>
              <atomic-category-facet
                field="geographicalhierarchy"
                label="World Atlas"
              ></atomic-category-facet>
            </atomic-facet-manager>
          </div>
          <div className="col">
            <div className="row">
              <atomic-breadcrumb-manager></atomic-breadcrumb-manager>
            </div>

            <div className="row">
              <atomic-did-you-mean></atomic-did-you-mean>
              <atomic-query-error></atomic-query-error>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <atomic-query-summary></atomic-query-summary>
              <atomic-sort-dropdown></atomic-sort-dropdown>
            </div>

            <div className="row">
              <atomic-result-list></atomic-result-list>
            </div>

            <div className="d-flex justify-content-between my-4">
              <atomic-pager></atomic-pager>
              <atomic-results-per-page></atomic-results-per-page>
            </div>
          </div>
        </div>
        <atomic-history></atomic-history>
      </atomic-search-interface>
      ,
    </div>
  );
}

export default App;

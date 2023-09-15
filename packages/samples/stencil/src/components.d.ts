/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { SearchEngine } from "@coveo/headless";
import { Router } from "stencil-router-v2";
export { SearchEngine } from "@coveo/headless";
export { Router } from "stencil-router-v2";
export namespace Components {
    interface AppRoot {
    }
    interface ResultsManager {
    }
    interface SampleComponent {
    }
    interface SampleResultComponent {
    }
    interface SearchPage {
        "engine"?: SearchEngine;
    }
    interface StandaloneSearchBox {
        "router": Router;
    }
}
declare global {
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLResultsManagerElement extends Components.ResultsManager, HTMLStencilElement {
    }
    var HTMLResultsManagerElement: {
        prototype: HTMLResultsManagerElement;
        new (): HTMLResultsManagerElement;
    };
    interface HTMLSampleComponentElement extends Components.SampleComponent, HTMLStencilElement {
    }
    var HTMLSampleComponentElement: {
        prototype: HTMLSampleComponentElement;
        new (): HTMLSampleComponentElement;
    };
    interface HTMLSampleResultComponentElement extends Components.SampleResultComponent, HTMLStencilElement {
    }
    var HTMLSampleResultComponentElement: {
        prototype: HTMLSampleResultComponentElement;
        new (): HTMLSampleResultComponentElement;
    };
    interface HTMLSearchPageElement extends Components.SearchPage, HTMLStencilElement {
    }
    var HTMLSearchPageElement: {
        prototype: HTMLSearchPageElement;
        new (): HTMLSearchPageElement;
    };
    interface HTMLStandaloneSearchBoxElement extends Components.StandaloneSearchBox, HTMLStencilElement {
    }
    var HTMLStandaloneSearchBoxElement: {
        prototype: HTMLStandaloneSearchBoxElement;
        new (): HTMLStandaloneSearchBoxElement;
    };
    interface HTMLElementTagNameMap {
        "app-root": HTMLAppRootElement;
        "results-manager": HTMLResultsManagerElement;
        "sample-component": HTMLSampleComponentElement;
        "sample-result-component": HTMLSampleResultComponentElement;
        "search-page": HTMLSearchPageElement;
        "standalone-search-box": HTMLStandaloneSearchBoxElement;
    }
}
declare namespace LocalJSX {
    interface AppRoot {
    }
    interface ResultsManager {
    }
    interface SampleComponent {
    }
    interface SampleResultComponent {
    }
    interface SearchPage {
        "engine"?: SearchEngine;
    }
    interface StandaloneSearchBox {
        "router": Router;
    }
    interface IntrinsicElements {
        "app-root": AppRoot;
        "results-manager": ResultsManager;
        "sample-component": SampleComponent;
        "sample-result-component": SampleResultComponent;
        "search-page": SearchPage;
        "standalone-search-box": StandaloneSearchBox;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "results-manager": LocalJSX.ResultsManager & JSXBase.HTMLAttributes<HTMLResultsManagerElement>;
            "sample-component": LocalJSX.SampleComponent & JSXBase.HTMLAttributes<HTMLSampleComponentElement>;
            "sample-result-component": LocalJSX.SampleResultComponent & JSXBase.HTMLAttributes<HTMLSampleResultComponentElement>;
            "search-page": LocalJSX.SearchPage & JSXBase.HTMLAttributes<HTMLSearchPageElement>;
            "standalone-search-box": LocalJSX.StandaloneSearchBox & JSXBase.HTMLAttributes<HTMLStandaloneSearchBoxElement>;
        }
    }
}

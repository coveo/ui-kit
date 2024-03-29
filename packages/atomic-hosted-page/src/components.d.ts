/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { PlatformEnvironment } from "@coveo/headless";
export { PlatformEnvironment } from "@coveo/headless";
export namespace Components {
    /**
     * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
     * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
     */
    interface AtomicHostedPage {
        /**
          * Returns the unique, organization-specific endpoint(s)
          * @param organizationId
          * @param env
         */
        "getOrganizationEndpoints": (organizationId: string, env?: PlatformEnvironment) => Promise<{ platform: string; analytics: string; search: string; admin: string; }>;
        "initialize": (options: AtomicHostedPageInitializationOptions) => Promise<void>;
    }
    /**
     * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
     * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
     */
    interface AtomicSimpleBuilder {
        /**
          * Returns the unique, organization-specific endpoint(s)
          * @param organizationId
          * @param env
         */
        "getOrganizationEndpoints": (organizationId: string, env?: PlatformEnvironment) => Promise<{ platform: string; analytics: string; search: string; admin: string; }>;
        "initialize": (options: AtomicSimpleBuilderInitializationOptions) => Promise<void>;
    }
}
declare global {
    /**
     * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
     * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
     */
    interface HTMLAtomicHostedPageElement extends Components.AtomicHostedPage, HTMLStencilElement {
    }
    var HTMLAtomicHostedPageElement: {
        prototype: HTMLAtomicHostedPageElement;
        new (): HTMLAtomicHostedPageElement;
    };
    /**
     * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
     * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
     */
    interface HTMLAtomicSimpleBuilderElement extends Components.AtomicSimpleBuilder, HTMLStencilElement {
    }
    var HTMLAtomicSimpleBuilderElement: {
        prototype: HTMLAtomicSimpleBuilderElement;
        new (): HTMLAtomicSimpleBuilderElement;
    };
    interface HTMLElementTagNameMap {
        "atomic-hosted-page": HTMLAtomicHostedPageElement;
        "atomic-simple-builder": HTMLAtomicSimpleBuilderElement;
    }
}
declare namespace LocalJSX {
    /**
     * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
     * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
     */
    interface AtomicHostedPage {
    }
    /**
     * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
     * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
     */
    interface AtomicSimpleBuilder {
    }
    interface IntrinsicElements {
        "atomic-hosted-page": AtomicHostedPage;
        "atomic-simple-builder": AtomicSimpleBuilder;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            /**
             * A Web Component used to inject a Coveo Hosted Search Page in the DOM.
             * Pulls from the [Hosted Pages API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/Hosted%20Page)
             */
            "atomic-hosted-page": LocalJSX.AtomicHostedPage & JSXBase.HTMLAttributes<HTMLAtomicHostedPageElement>;
            /**
             * A Web Component used to inject a [Coveo Search Interface made with the simple builder](https://docs.coveo.com/en/m7e92019/adobe/build-the-search-solution-using-a-coveo-ui-library-directly#search-interface-builder) in the DOM.
             * Pulls from the [Search Interfaces API](https://platform.cloud.coveo.com/docs?urls.primaryName=Search%20Interface%20Service#/)
             */
            "atomic-simple-builder": LocalJSX.AtomicSimpleBuilder & JSXBase.HTMLAttributes<HTMLAtomicSimpleBuilderElement>;
        }
    }
}

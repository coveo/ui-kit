interface AtomicSearchInterfaceElement extends HTMLElement {
    initialize(config: {
        organizationId: string;
        accessToken: string;
        search: {
            searchHub: string;
        };
        analytics: {
            originLevel2: string;
        };
    }): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'atomic-search-interface': AtomicSearchInterfaceElement;
    }
}
export declare function insertAtomicSearchBox(): void;
export {};

export * from '../../types/components';

export declare function defineCustomElements(win?: Window, opts?: CustomElementsDefineOptions): void;

/**
 * @deprecated
 */
export declare function applyPolyfills(): Promise<void>;

/**
 * @deprecated Since v3.52.0, `@coveo/atomic` does not longer add script or style tags. The setNonce function is now a no-op and can be safely removed from your codebase.
 */
export declare function setNonce(nonce: string): void;
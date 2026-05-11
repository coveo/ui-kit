export const ReactNativeRuntimeWarning = `
        We've detected you're using React Native but have not provided the corresponding runtime, 
        for an optimal experience please use the "coveo.analytics/react-native" subpackage.
        Follow the Readme on how to set it up: https://github.com/coveo/coveo.analytics.js#using-react-native
    `;

export function isReactNative() {
    return typeof navigator != 'undefined' && navigator.product == 'ReactNative';
}

export const ReactNativeRuntimeWarning = `
        We've detected you're using React Native but have not provided the corresponding runtime, 
        for an optimal experience please install @react-native-async-storage/async-storage and instantiate 
        your analytics client as follows:
        
        import {ReactNativeRuntime} from 'coveo.analytics/react-native';
        
        const analytics = new CoveoAnalytics({
            ...your options,
            runtimeEnvironment: new ReactNativeRuntime();
        })
    `;

export function isReactNative() {
    return typeof navigator != 'undefined' && navigator.product == 'ReactNative';
}

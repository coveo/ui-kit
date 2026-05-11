import CoveoAnalyticsClient from '../client/analytics';
import {ReactNativeRuntime} from './react-native-runtime';

describe('ReactNativeRuntime', () => {
    let runtimeEnvironment: ReactNativeRuntime;
    let client: CoveoAnalyticsClient;

    beforeEach(() => {
        runtimeEnvironment = new ReactNativeRuntime({
            storage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
        });
        client = new CoveoAnalyticsClient({runtimeEnvironment});
    });

    it('should call "storage.getItem" when getting the visitor ID', async () => {
        jest.spyOn(runtimeEnvironment.storage, 'getItem');
        await client.getCurrentVisitorId();
        expect(runtimeEnvironment.storage.getItem).toHaveBeenCalled();
    });

    it('should call "storage.getItem" when getting the visitor ID', async () => {
        jest.spyOn(runtimeEnvironment.storage, 'setItem');
        await client.setCurrentVisitorId('myid');
        expect(runtimeEnvironment.storage.setItem).toHaveBeenCalled();
    });
});

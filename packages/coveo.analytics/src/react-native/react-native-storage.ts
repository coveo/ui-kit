import {WebStorage} from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ReactNativeStorage implements WebStorage {
    async getItem(key: string) {
        return AsyncStorage.getItem(key);
    }
    async setItem(key: string, data: string) {
        return AsyncStorage.setItem(key, data);
    }
    async removeItem(key: string) {
        AsyncStorage.removeItem(key);
    }
}

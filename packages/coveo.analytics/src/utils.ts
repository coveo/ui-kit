export function popFromObject<T>(object: any, key: string): T {
    if (object) {
        var value = object[key];
        delete object[key];
        return value;
    }
}

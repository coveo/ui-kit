export function popFromObject(object: any, key: string): string {
    if (object) {
        var value = object[key];
        delete object[key];
        return value;
    }
}

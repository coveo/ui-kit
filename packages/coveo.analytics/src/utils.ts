export function popFromObject(object: any, key: string): string {
    if (object && object[key]) {
        var value = object[key];
        delete object[key];
        return value;
    }
}

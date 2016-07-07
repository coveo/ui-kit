// objectAssing ponyfill by sindresorhus ported to typescript
// https://github.com/sindresorhus/object-assign/blob/master/index.js
const hasOwnProperty = Object.prototype.hasOwnProperty;
const getOwnPropertySymbols: any = (<any>Object).getOwnPropertySymbols;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;

export interface IObjectAssign {
    (target: any, ...sources: any[]) : any;
}

const objectAssignPonyfill: IObjectAssign = (target: any, ...sources: any[]): any => {
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    const output = Object(target);

    sources.forEach((source) => {
        const from = Object(source);

        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                output[key] = from[key];
            }
        }

        if (getOwnPropertySymbols) {
            const symbols = getOwnPropertySymbols(from);
            symbols.forEach((symbol: any) => {
                if (propIsEnumerable.call(from, symbol)) {
                    output[symbol] = from[symbol];
                }
            });
        }
    });
    return output;
};

export const ponyfill = objectAssignPonyfill;
export const assign: IObjectAssign = typeof (<any>Object).assign === 'function' ?  (<any>Object).assign : objectAssignPonyfill;
export default assign;

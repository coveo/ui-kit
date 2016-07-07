import test from 'ava';
import { assign, ponyfill } from '../src/objectassign';

[ponyfill, assign].forEach( (assignToTest) => {
    const name = assignToTest === ponyfill ? 'ponyfill' : 'native assign';

    test(`${name}: null target should throw`, t => {
        t.throws(() => assignToTest(undefined, {}), /null/ );
    });

    test(`${name}: nested properties should be erased`, t => {
        const srcs = [{'1': 2}, {'1': 3}];
        const result = assignToTest({}, srcs[0], srcs[1]);

        t.deepEqual(result, {'1': 3});
    });

    test(`${name}: should copy all properties`, t => {
        const srcs = [{'1': 2}, {'1': {'2': 3}, '2': 3}, {'3': 4}];
        const result = assignToTest({}, srcs[0], srcs[1], srcs[2]);

        t.deepEqual(result, {'1': {'2': 3}, '2': 3, '3': 4});
    });

    test(`${name}: empty object should return empty`, t => {
        t.deepEqual(assignToTest({}, {}, {}), {});
    });
});

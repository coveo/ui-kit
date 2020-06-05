import {hasCryptoRandomValues} from "../detector";

export const uuidv4 = (a?: number | string): string => {
    if (!!a) {
        return (Number(a) ^ (getRandomValues(new Uint8Array(1))[0] % 16 >> (Number(a) / 4))).toString(16);
    }
    return (`${1e7}` + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuidv4);
};

const getRandomValues = (rnds: Uint8Array) => {
    if (hasCryptoRandomValues()) {
        return crypto.getRandomValues(rnds);
    }
    for (var i = 0, r = 0; i < rnds.length; i++) {
        if ((i & 0x03) === 0) {
            r = Math.random() * 0x100000000;
        }
        rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
    }
    return rnds;
};

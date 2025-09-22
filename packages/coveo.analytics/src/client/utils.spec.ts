import {truncateUrl} from './utils';

describe('utils', () => {
    describe('truncateUrl', () => {
        // Note: to obtain a UTF-8 encoded escape sequence, run encodeUriComponent('<value>') in your browser console or NodeJS REPL
        const URL_PLAIN = 'http://coveo.com/this/is/a/really/long/url/that/will/be/truncated?at=some&arbitrary=point';

        it.each([[8], [16], [32], [64], [128]])(
            `truncateUrl('${URL_PLAIN}', %d) truncates to exactly that length`,
            (limit) => {
                expect(truncateUrl(URL_PLAIN, limit)).toBe(URL_PLAIN.substring(0, limit));
            },
        );

        /** Decoded: `'http://test/ ¿OKツ😅#fine'` */
        const URL_WITH_ESCAPES = 'http://test/%20%C2%BFOK%E3%83%84%F0%9F%98%85#fine';
        // Number of bytes in code-point:     <1>< 2  >  <   3   ><    4     >

        it.each([[7], [22], [45], [46], [47], [48], [100]])(
            `truncateUrl('${URL_WITH_ESCAPES}', %d) truncates to the exact limit outside of codepoints`,
            (limit) => {
                expect(truncateUrl(URL_WITH_ESCAPES, limit)).toBe(URL_WITH_ESCAPES.substring(0, limit));
            },
        );

        it.each([
            [12, 12],
            [13, 12],
            [14, 12],
            [15, 15],
        ])(
            `truncateUrl('${URL_WITH_ESCAPES}', %d) does not break up single-byte codepoints`,
            (limit, expectedLength) => {
                expect(truncateUrl(URL_WITH_ESCAPES, limit)).toBe(URL_WITH_ESCAPES.substring(0, expectedLength));
            },
        );

        it.each([
            [15, 15],
            [16, 15],
            [17, 15],
            [18, 15],
            [19, 15],
            [20, 15],
            [21, 21],
        ])(`truncateUrl('${URL_WITH_ESCAPES}', %d) does not break up two-byte codepoints`, (limit, expectedLength) => {
            expect(truncateUrl(URL_WITH_ESCAPES, limit)).toBe(URL_WITH_ESCAPES.substring(0, expectedLength));
        });

        it.each([
            [23, 23],
            [24, 23],
            [25, 23],
            [26, 23],
            [27, 23],
            [28, 23],
            [29, 23],
            [30, 23],
            [31, 23],
            [32, 32],
        ])(
            `truncateUrl('${URL_WITH_ESCAPES}', %d) does not break up three-byte codepoints`,
            (limit, expectedLength) => {
                expect(truncateUrl(URL_WITH_ESCAPES, limit)).toBe(URL_WITH_ESCAPES.substring(0, expectedLength));
            },
        );

        it.each([
            [32, 32],
            [33, 32],
            [34, 32],
            [35, 32],
            [36, 32],
            [37, 32],
            [38, 32],
            [39, 32],
            [40, 32],
            [41, 32],
            [42, 32],
            [43, 32],
            [44, 44],
        ])(`truncateUrl('${URL_WITH_ESCAPES}', %d) does not break up four-byte codepoints`, (limit, expectedLength) => {
            expect(truncateUrl(URL_WITH_ESCAPES, limit)).toBe(URL_WITH_ESCAPES.substring(0, expectedLength));
        });

        const URL_WITH_INVALID_ESCAPES = 'http://test/%this%is%so%invalid';

        it.each([
            [12, 12],
            [13, 12],
            [14, 12],
            [15, 15],
            [16, 16],
            [17, 17],
            [18, 17],
            [19, 17],
            [20, 20],
            [21, 20],
            [22, 20],
            [23, 23],
            [24, 23],
            [25, 23],
            [26, 26],
        ])(
            `truncateUrl('${URL_WITH_INVALID_ESCAPES}', %d) only checks for percent with invalid escapes`,
            (limit, expectedLength) => {
                expect(truncateUrl(URL_WITH_INVALID_ESCAPES, limit)).toBe(
                    URL_WITH_INVALID_ESCAPES.substring(0, expectedLength),
                );
            },
        );
    });
});

describe('doNotTrack', () => {
    let doNotTrack: () => boolean;
    function initModule(
        hasNav: boolean,
        hasWin: boolean,
        options?: {
            navigatorGlobalPrivacyControl?: any;
            navigatorDoNotTrack?: any;
            navigatorMsDoNotTrack?: any;
            windowDoNotTrack?: any;
        },
    ) {
        jest.resetModules();
        jest.mock('./detector', () => ({
            hasNavigator: () => hasNav,
            hasWindow: () => hasWin,
        }));
        if (hasNav) {
            Object.defineProperty(<any>navigator, 'globalPrivacyControl', {
                get() {
                    return options!.navigatorGlobalPrivacyControl;
                },
                configurable: true,
            });
            Object.defineProperty(<any>navigator, 'doNotTrack', {
                get() {
                    return options!.navigatorDoNotTrack;
                },
                configurable: true,
            });
            Object.defineProperty(<any>navigator, 'msDoNotTrack', {
                get() {
                    return options!.navigatorMsDoNotTrack;
                },
                configurable: true,
            });
        }
        if (hasWin) {
            Object.defineProperty(<any>window, 'doNotTrack', {
                get() {
                    return options!.windowDoNotTrack;
                },
                configurable: true,
            });
        }
        doNotTrack = require('./donottrack').doNotTrack;
    }
    describe('without a Navigator and without window', () => {
        it('should be false', () => {
            initModule(false, false);

            expect(doNotTrack()).toBeFalsy();
        });
    });
    describe('with a Navigator', () => {
        it('should respect GPC false', () => {
            initModule(true, false, {
                navigatorGlobalPrivacyControl: false,
            });

            expect(doNotTrack()).toBeFalsy();
        });
        it('should respect GPC true', () => {
            initModule(true, false, {
                navigatorGlobalPrivacyControl: true,
            });

            expect(doNotTrack()).toBeTruthy();
        });
        it('should respect GPC undefined', () => {
            initModule(true, false, {
                navigatorGlobalPrivacyControl: undefined,
            });

            expect(doNotTrack()).toBeFalsy();
        });

        [true, 'yes', '1'].forEach((value) => {
            it('should fallback on `navigator.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, false, {
                    navigatorDoNotTrack: value,
                });

                expect(doNotTrack()).toBeTruthy();
            });

            it('should fallback on `navigator.msDoNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, false, {
                    navigatorMsDoNotTrack: value,
                });
                expect(doNotTrack()).toBeTruthy();
            });
        });

        [false, 'no', '0', 'unspecified'].forEach((value) => {
            it('should fallback on `navigator.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, false, {
                    navigatorDoNotTrack: value,
                });

                expect(doNotTrack()).toBeFalsy();
            });

            it('should fallback on `navigator.msDoNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, false, {
                    navigatorMsDoNotTrack: value,
                });
                expect(doNotTrack()).toBeFalsy();
            });
        });
    });

    describe('with a Window', () => {
        [true, 'yes', '1'].forEach((value) => {
            it('should fallback on `window.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(false, true, {
                    windowDoNotTrack: value,
                });
                expect(doNotTrack()).toBeTruthy();
            });
        });

        [false, 'no', '0', 'unspecified'].forEach((value) => {
            it('should fallback on `window.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(false, true, {
                    windowDoNotTrack: value,
                });
                expect(doNotTrack()).toBeFalsy();
            });
        });
    });

    describe('with a Navigator and a Window', () => {
        it('should fallback on `window.doNotTrack` if all navigator properties are falsy', () => {
            initModule(true, true, {
                navigatorDoNotTrack: false,
                navigatorGlobalPrivacyControl: undefined,
                navigatorMsDoNotTrack: '0',
                windowDoNotTrack: 1,
            });
            expect(doNotTrack()).toBeTruthy();
        });
    });
});

describe('shouldDisableAnalyticsForPrivacy', () => {
    let shouldDisableAnalyticsForPrivacy: (disableBrowserPrivacySignals?: boolean) => boolean;

    function initModule(signal: {navigatorGlobalPrivacyControl?: any; navigatorDoNotTrack?: any}) {
        jest.resetModules();
        jest.mock('./detector', () => ({
            hasNavigator: () => true,
            hasWindow: () => true,
        }));
        Object.defineProperty(<any>navigator, 'globalPrivacyControl', {
            get() {
                return signal.navigatorGlobalPrivacyControl;
            },
            configurable: true,
        });
        Object.defineProperty(<any>navigator, 'doNotTrack', {
            get() {
                return signal.navigatorDoNotTrack;
            },
            configurable: true,
        });
        Object.defineProperty(<any>navigator, 'msDoNotTrack', {
            get() {
                return undefined;
            },
            configurable: true,
        });
        Object.defineProperty(<any>window, 'doNotTrack', {
            get() {
                return undefined;
            },
            configurable: true,
        });
        shouldDisableAnalyticsForPrivacy = require('./donottrack').shouldDisableAnalyticsForPrivacy;
    }

    it('disables when DNT is active and the option is omitted', () => {
        initModule({navigatorDoNotTrack: '1'});
        expect(shouldDisableAnalyticsForPrivacy()).toBe(true);
    });

    it('disables when GPC is active and the option is omitted', () => {
        initModule({navigatorGlobalPrivacyControl: true});
        expect(shouldDisableAnalyticsForPrivacy()).toBe(true);
    });

    it('keeps analytics when DNT is active but the option is true', () => {
        initModule({navigatorDoNotTrack: '1'});
        expect(shouldDisableAnalyticsForPrivacy(true)).toBe(false);
    });

    it('keeps analytics when GPC is active but the option is true (umbrella overrides GPC)', () => {
        initModule({navigatorGlobalPrivacyControl: true});
        expect(shouldDisableAnalyticsForPrivacy(true)).toBe(false);
    });

    it('keeps analytics when both DNT and GPC are active but the option is true', () => {
        initModule({navigatorDoNotTrack: '1', navigatorGlobalPrivacyControl: true});
        expect(shouldDisableAnalyticsForPrivacy(true)).toBe(false);
    });

    it('does not disable when no signal is active and the option is omitted', () => {
        initModule({});
        expect(shouldDisableAnalyticsForPrivacy()).toBe(false);
    });

    it('treats a false option the same as omitting it', () => {
        initModule({navigatorDoNotTrack: '1'});
        expect(shouldDisableAnalyticsForPrivacy(false)).toBe(true);
    });
});

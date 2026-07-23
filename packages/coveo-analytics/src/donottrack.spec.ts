describe('doNotTrack', () => {
    let doNotTrack: () => boolean;
    function initModule(
        hasNav: boolean,
        options?: {
            navigatorGlobalPrivacyControl?: any;
            navigatorDoNotTrack?: any;
            navigatorMsDoNotTrack?: any;
            windowDoNotTrack?: any;
        }
    ) {
        jest.resetModules();
        jest.mock('./detector', () => ({
            hasNavigator: () => hasNav,
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
            Object.defineProperty(<any>window, 'doNotTrack', {
                get() {
                    return options!.windowDoNotTrack;
                },
                configurable: true,
            });
        }
        doNotTrack = require('./donottrack').doNotTrack;
    }
    describe('without a Navigator', () => {
        it('should be false', () => {
            initModule(false);

            expect(doNotTrack()).toBeFalsy();
        });
    });
    describe('with a Navigator', () => {
        it('should respect GPC false', () => {
            initModule(true, {
                navigatorGlobalPrivacyControl: false,
            });

            expect(doNotTrack()).toBeFalsy();
        });
        it('should respect GPC true', () => {
            initModule(true, {
                navigatorGlobalPrivacyControl: true,
            });

            expect(doNotTrack()).toBeTruthy();
        });
        it('should respect GPC undefined', () => {
            initModule(true, {
                navigatorGlobalPrivacyControl: undefined,
            });

            expect(doNotTrack()).toBeFalsy();
        });

        [true, 'yes', '1'].forEach((value) => {
            it('should fallback on `navigator.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    navigatorDoNotTrack: value,
                });

                expect(doNotTrack()).toBeTruthy();
            });

            it('should fallback on `navigator.msDoNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    navigatorMsDoNotTrack: value,
                });
                expect(doNotTrack()).toBeTruthy();
            });

            it('should fallback on `window.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    windowDoNotTrack: value,
                });
                expect(doNotTrack()).toBeTruthy();
            });
        });

        [false, 'no', '0', 'unspecified'].forEach((value) => {
            it('should fallback on `navigator.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    navigatorDoNotTrack: value,
                });

                expect(doNotTrack()).toBeFalsy();
            });

            it('should fallback on `navigator.msDoNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    navigatorMsDoNotTrack: value,
                });
                expect(doNotTrack()).toBeFalsy();
            });

            it('should fallback on `window.doNotTrack`: ' + JSON.stringify(value), () => {
                initModule(true, {
                    windowDoNotTrack: value,
                });
                expect(doNotTrack()).toBeFalsy();
            });
        });
    });
});

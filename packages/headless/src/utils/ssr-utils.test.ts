import {CookieStore, analyticsTrackerMiddleware} from './ssr-utils';

describe('ssr-utils', () => {
  let cookies: CookieStore;
  let headers: Headers;

  function createCookieStore(): CookieStore {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
  }

  beforeEach(() => {
    headers = new Headers();
    cookies = createCookieStore();
  });

  describe('analyticsTrackerMiddleware', () => {
    it('should read for coveo_visitorId', () => {
      analyticsTrackerMiddleware(headers, cookies);

      expect(cookies.get).toHaveBeenCalledWith('coveo_visitorId');
    });

    describe.each(['DNT', 'Sec-GPC'])(
      'when the user has enabled do not track with the %s header',
      (header: string) => {
        it('should delete the cookie', () => {
          headers.set(header, '1');

          analyticsTrackerMiddleware(headers, cookies);

          expect(cookies.delete).toHaveBeenCalledWith('coveo_visitorId');
        });
      }
    );

    describe('when the user has enabled "coveo_do_not_track" in the cookies', () => {
      it('should delete the cookie', () => {
        cookies.get = jest.fn().mockReturnValue('1');

        analyticsTrackerMiddleware(headers, cookies);

        expect(cookies.delete).toHaveBeenCalledWith('coveo_visitorId');
      });
    });

    describe('when the user has not enabled do not track', () => {
      it('should not delete the visitor id', () => {
        analyticsTrackerMiddleware(headers, cookies);

        expect(cookies.delete).not.toHaveBeenCalled();
      });

      it('should set the cookie with an expiry of 1 year', () => {
        analyticsTrackerMiddleware(headers, cookies);

        expect(cookies.set).toHaveBeenCalledWith(
          'coveo_visitorId',
          expect.any(String),
          {
            maxAge: 31556926000,
          }
        );
      });
    });
  });
});

import {TimeSpan} from '../timeAndDateUtils';

describe('quanticUtils/timeAndDateUtils', () => {
  describe('TimeSpan', () => {
    describe('getYoutubeFormatTimestamp', () => {
      it('should return the correct YouTube timestamp format for timestamps of less than a minute', () => {
        const timeSpan = new TimeSpan(45000);
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('0:45');
      });

      it('should return the correct YouTube timestamp format for timestamps of more than an hour', () => {
        const timeSpan = new TimeSpan(3661000);
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('1:01:01');
      });

      it('should return the correct YouTube timestamp format for timestamps of less than an hour', () => {
        const timeSpan = new TimeSpan(300000);
        expect(timeSpan.getYoutubeFormatTimestamp()).toBe('05:00');
      });
    });
  });
});
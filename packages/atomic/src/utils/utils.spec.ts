import {format} from './utils';

describe('format', () => {
  it('returns empty string for no names defined', () => {
    expect(format('', '', '')).toEqual('');
  });

  it('formats just first names', () => {
    expect(format('Joseph', '', '')).toEqual('Joseph');
  });

  it('formats first and last names', () => {
    expect(format('Joseph', '', 'Publique')).toEqual('Joseph Publique');
  });

  it('formats first, middle and last names', () => {
    expect(format('Joseph', 'Quincy', 'Publique')).toEqual(
      'Joseph Quincy Publique'
    );
  });
});

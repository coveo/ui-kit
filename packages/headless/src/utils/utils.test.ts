import {removeDuplicates} from './utils';

describe('removeDuplicates', () => {
  it('should return reduced array based on received getIdentifier function', () => {
    const objectToProcess = [
      {discriminator: 'a'},
      {discriminator: 'a'},
      {discriminator: 'b'},
    ];

    expect(
      removeDuplicates(objectToProcess, (v) => v.discriminator, false)
    ).toEqual([{discriminator: 'a'}, {discriminator: 'b'}]);
  });

  it('should reduce array from left to right if specified', () => {
    const objectToProcess = [
      {discriminator: 'a', otherValue: 1},
      {discriminator: 'a', otherValue: 2},
    ];

    expect(
      removeDuplicates(objectToProcess, (v) => v.discriminator, false)
    ).toEqual([{discriminator: 'a', otherValue: 2}]);
  });

  it('should reduce array from right to left if specified', () => {
    const objectToProcess = [
      {discriminator: 'a', otherValue: 1},
      {discriminator: 'a', otherValue: 2},
    ];

    expect(
      removeDuplicates(objectToProcess, (v) => v.discriminator, true)
    ).toEqual([{discriminator: 'a', otherValue: 1}]);
  });
});

import {removeDuplicates} from './utils.js';

describe('removeDuplicates', () => {
  it('should return reduced array based on received predicate', () => {
    const objectToProcess = [
      {discriminator: 'a'},
      {discriminator: 'b'},
      {discriminator: 'a'},
    ];

    expect(removeDuplicates(objectToProcess, (v) => v.discriminator)).toEqual([
      {discriminator: 'a'},
      {discriminator: 'b'},
    ]);
  });

  it('should keep left-most element when duplicates are found', () => {
    const arr = [
      {discriminator: 'a', otherProperty: 1},
      {discriminator: 'a', otherProperty: 2},
      {discriminator: 'a', otherProperty: 3},
      {discriminator: 'b', otherProperty: 1},
      {discriminator: 'c', otherProperty: 1},
      {discriminator: 'b', otherProperty: 2},
      {discriminator: 'd', otherProperty: 1},
    ];

    expect(removeDuplicates(arr, (v) => v.discriminator)).toEqual([
      {discriminator: 'a', otherProperty: 1},
      {discriminator: 'b', otherProperty: 1},
      {discriminator: 'c', otherProperty: 1},
      {discriminator: 'd', otherProperty: 1},
    ]);
  });

  it('should preserve original order', () => {
    const arr = [
      {discriminator: 'h'},
      {discriminator: 'e'},
      {discriminator: 'h'},
      {discriminator: 'l'},
      {discriminator: 'l'},
      {discriminator: 'L'},
      {discriminator: 'o'},
      {discriminator: 'o'},
      {discriminator: ' '},
      {discriminator: 'o'},
      {discriminator: 'w'},
      {discriminator: ' '},
      {discriminator: 'O'},
      {discriminator: 'O'},
      {discriminator: 'w'},
      {discriminator: 'r'},
      {discriminator: 'w'},
      {discriminator: 'r'},
      {discriminator: '7'},
      {discriminator: 'd'},
      {discriminator: '!'},
      {discriminator: '7'},
    ];

    expect(removeDuplicates(arr, (v) => v.discriminator)).toEqual([
      {discriminator: 'h'},
      {discriminator: 'e'},
      {discriminator: 'l'},
      {discriminator: 'L'},
      {discriminator: 'o'},
      {discriminator: ' '},
      {discriminator: 'w'},
      {discriminator: 'O'},
      {discriminator: 'r'},
      {discriminator: '7'},
      {discriminator: 'd'},
      {discriminator: '!'},
    ]);
  });
});

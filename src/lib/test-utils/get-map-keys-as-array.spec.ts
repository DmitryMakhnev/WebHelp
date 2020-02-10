import { getMapKesAsArray } from './get-map-keys-as-array';

describe('getMakKesAsArray', () => {
  it('works correct', () => {
    const map = new Map();
    map.set('key1', 1);
    map.set('key2', 2);
    expect(getMapKesAsArray(map)).toEqual(['key1', 'key2']);
  });
});

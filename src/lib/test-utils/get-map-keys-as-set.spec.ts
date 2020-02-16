import { getMapKeysAsSet } from './get-map-keys-as-set';

describe('getMapKeysAsSet', () => {
  it('correct', () => {
    const map = new Map();
    map.set('key1', 1);
    map.set('key2', 2);
    expect(getMapKeysAsSet(map)).toEqual(new Set(['key1', 'key2']));
  });
});

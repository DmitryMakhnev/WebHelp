import { getIdsOfItemsAsArray } from './get-ids-of-items-as-array';
import { createItems } from './create-items';

describe('getIdsOfItemsAsArray', () => {
  it('ids is correct', () => {
    const items = createItems(1, 2);
    const result = getIdsOfItemsAsArray(items);
    expect(result).toEqual(['1', '2']);
  });
});

import { createItems } from './create-items';
import { getIdsOfItems } from './get-ids-of-items';

describe('getIdsOfItems', () => {
  it('ids correct', () => {
    const items = createItems(0, 1);
    const itemIdes = getIdsOfItems(items);
    expect(itemIdes).toEqual(new Set(['0', '1']));
  });
});

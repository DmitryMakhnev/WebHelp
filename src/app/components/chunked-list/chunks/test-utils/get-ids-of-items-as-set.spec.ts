import { createItems } from './create-items';
import { getIdsOfItemsAsSet } from './get-ids-of-items-as-set';

describe('getIdsOfItemsAsSet', () => {
  it('ids correct', () => {
    const items = createItems(0, 1);
    const itemIdes = getIdsOfItemsAsSet(items);
    expect(itemIdes).toEqual(new Set(['0', '1']));
  });
});

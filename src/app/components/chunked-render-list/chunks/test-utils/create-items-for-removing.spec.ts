import { createItemsForRemoving } from './create-items-for-removing';
import { getIdsOfItemsAsArray } from './get-ids-of-items-as-array';


function createCommonItemsForRemoving() {
  return createItemsForRemoving(
    {
      from: 1,
      to: 2,
    },
    {
      from: 3,
      to: 4,
    },
    {
      from: 5,
      to: 6,
    },
  );
}

describe('createItemsForRemoving', () => {
  describe('common creation', () => {
    it('all is correct', () => {
      const all = createCommonItemsForRemoving().all;
      expect(getIdsOfItemsAsArray(all)).toEqual(['1', '2', '3', '4', '5', '6']);
    });
    it('removed is correct', () => {
      const removed = createCommonItemsForRemoving().removed;
      expect(getIdsOfItemsAsArray(removed)).toEqual(['3', '4']);
    });
    it('notRemoved is correct', () => {
      const notRemoved = createCommonItemsForRemoving().notRemoved;
      expect(getIdsOfItemsAsArray(notRemoved)).toEqual(['1', '2', '5', '6']);
    });
    it('before is correct', () => {
      const before = createCommonItemsForRemoving().before;
      expect(getIdsOfItemsAsArray(before)).toEqual(['1', '2']);
    });
    it('after is correct', () => {
      const after = createCommonItemsForRemoving().after;
      expect(getIdsOfItemsAsArray(after)).toEqual(['5', '6']);
    });
  });
  describe('corner cases', () => {
    it('with prefixes', () => {
      const resultWithPrefix = createItemsForRemoving(
        {
          from: 1,
          to: 2,
          prefix: 'before_',
        },
        {
          from: 1,
          to: 2,
          prefix: 'removed_',
        },
        {
          from: 1,
          to: 2,
          prefix: 'after_',
        },
      );
      const all = resultWithPrefix.all;
      expect(
        getIdsOfItemsAsArray(all),
      ).toEqual(
        ['before_1', 'before_2', 'removed_1', 'removed_2', 'after_1', 'after_2'],
      );
    });
    it('without before', () => {
      const resultWithPrefix = createItemsForRemoving(
        null,
        {
          from: 1,
          to: 2,
          prefix: 'removed_',
        },
        {
          from: 1,
          to: 2,
          prefix: 'after_',
        },
      );
      const all = resultWithPrefix.all;
      const before = resultWithPrefix.before;
      expect(
        getIdsOfItemsAsArray(all),
      ).toEqual(
        ['removed_1', 'removed_2', 'after_1', 'after_2'],
      );
      expect(before).toEqual([]);
    });
    it('without after', () => {
      const resultWithPrefix = createItemsForRemoving(
        {
          from: 1,
          to: 2,
          prefix: 'before_',
        },
        {
          from: 1,
          to: 2,
          prefix: 'removed_',
        },
      );
      const all = resultWithPrefix.all;
      const after = resultWithPrefix.after;
      expect(
        getIdsOfItemsAsArray(all),
      ).toEqual(
        ['before_1', 'before_2', 'removed_1', 'removed_2'],
      );
      expect(after).toEqual([]);
    });
  });
});

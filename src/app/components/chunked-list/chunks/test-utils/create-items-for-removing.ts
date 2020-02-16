import { ChunkedListItem } from '../../types/chunked-list-item';
import { createItems } from './create-items';
import { ItemsCreationOptions } from './items-creation-options';

export interface ItemsForRemovingCreationResult {
  all: ChunkedListItem[];
  before: ChunkedListItem[];
  removed: ChunkedListItem[];
  after: ChunkedListItem[];
  notRemoved: ChunkedListItem[];
}

export function createItemsForRemoving(
  before: ItemsCreationOptions|null,
  removed: ItemsCreationOptions,
  after?: ItemsCreationOptions,
): ItemsForRemovingCreationResult {
  const beforeItems = before ? createItems(before.from, before.to, before.prefix) : [];
  const removedItems = createItems(removed.from, removed.to, removed.prefix);
  const afterItems = after ? createItems(after.from, after.to, after.prefix) : [];
  return {
    before: beforeItems,
    removed: removedItems,
    after: afterItems,
    all: beforeItems.concat(removedItems, afterItems),
    notRemoved: beforeItems.concat(afterItems),
  };
}

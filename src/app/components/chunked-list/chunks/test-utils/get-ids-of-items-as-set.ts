import { ChunkedListItem } from '../../types/chunked-list-item';

export function getIdsOfItemsAsSet(items: ChunkedListItem[]): Set<string> {
  const result = new Set<string>();
  items.forEach(item => result.add(item.id));
  return result;
}

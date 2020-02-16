import { ChunkedListItem } from '../../types/chunked-list-item';

export function getIdsOfItemsAsArray(items: ChunkedListItem[]): string[] {
  return items.map(item => item.id);
}

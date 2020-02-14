import { ChunkedRenderListItem } from '../../chunked-render-list-item';

export function getIdsOfItemsAsArray(items: ChunkedRenderListItem[]): string[] {
  return items.map(item => item.id);
}

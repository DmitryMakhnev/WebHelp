import { ChunkedRenderListItem } from '../../chunked-render-list-item';

export function getIdsOfItems(items: ChunkedRenderListItem[]): Set<string> {
  const result = new Set<string>();
  items.forEach(item => result.add(item.id));
  return result;
}

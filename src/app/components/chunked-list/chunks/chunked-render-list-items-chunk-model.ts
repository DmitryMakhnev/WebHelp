import { ChunkedListItem } from '../types/chunked-list-item';

export interface ChunkedRenderListItemsChunkModel<T extends ChunkedListItem> {
  id: string;
  items: T[];
  itemIndexesById: Map<string, number>;
}

export function createChunkedRenderListItemsChunkModel<
  T extends ChunkedListItem
>(id: string, items: T[]): ChunkedRenderListItemsChunkModel<T> {
  const itemIndexesById = new Map<string, number>();
  items.forEach((item, i) => {
    itemIndexesById.set(item.id, i);
  });
  return {
    id,
    items,
    itemIndexesById,
  };
}

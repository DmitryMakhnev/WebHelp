import { ChunkedRenderListItemRepresentation } from '../chunked-render-list-item-representation';

export interface ChunkedRenderListItemsChunkModel<T extends ChunkedRenderListItemRepresentation> {
  id: number;
  items: T[];
  itemIndexesById: Map<string, number>;
}

export function createChunkedRenderListItemsChunkModel<
  T extends ChunkedRenderListItemRepresentation
>(id: number, items: T[]): ChunkedRenderListItemsChunkModel<T> {
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

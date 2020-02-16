import { ChunkedListItem } from '../types/chunked-list-item';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';

export function putChunkAfterChunkWithItemWithId<IT extends ChunkedListItem>(
  chunks: ChunkedRenderListItemsChunkModel<IT>[],
  chunk: ChunkedRenderListItemsChunkModel<IT>,
  itemId: string,
) {
  const findChunkWithItemIndex = chunks.findIndex(
    chunkFromChunks => chunkFromChunks.itemIndexesById.has(itemId),
  );
  return chunks.slice(0, findChunkWithItemIndex + 1)
    .concat(
      chunk,
      chunks.slice(findChunkWithItemIndex + 1),
    );
}

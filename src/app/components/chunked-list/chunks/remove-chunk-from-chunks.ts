import { ChunkedListItem } from '../types/chunked-list-item';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';

export function removeChunkFromChunks<IT extends ChunkedListItem>(
  chunks: ChunkedRenderListItemsChunkModel<IT>[],
  chunk: ChunkedRenderListItemsChunkModel<IT>,
): ChunkedRenderListItemsChunkModel<IT>[] {
  return chunks.filter(
    chunkFromChunks => chunkFromChunks !== chunk,
  );
}

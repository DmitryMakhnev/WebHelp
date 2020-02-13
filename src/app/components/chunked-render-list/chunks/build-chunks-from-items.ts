import {
  ChunkedRenderListItemsChunkModel,
  createChunkedRenderListItemsChunkModel,
} from './chunked-render-list-items-chunk-model';
import { ChunkedRenderListItem } from '../chunked-render-list-item';

export function buildChunksFromItems<IT extends ChunkedRenderListItem>(
  items: IT[],
  getNewChunkId: () => string,
  chunkSize: number,
): ChunkedRenderListItemsChunkModel<IT>[] {
  const chunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  const allChunksCount = items.length / chunkSize;
  const ceilChunksCount = Math.floor(allChunksCount);

  const iMax = ceilChunksCount + (allChunksCount === ceilChunksCount ? 0 : 1);
  for (let i = 0; i !== iMax; i += 1) {
    chunks.push(
      createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        items.slice(
          chunkSize * i,
          chunkSize * (i + 1),
        ),
      ),
    );
  }
  return chunks;
}

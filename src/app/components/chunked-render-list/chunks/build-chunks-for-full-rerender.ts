import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsModification } from '../chunked-render-list-items-modification';
import {
  ChunkedRenderListItemsChunkModel,
  createChunkedRenderListItemsChunkModel,
} from './chunked-render-list-items-chunk-model';
import { ChunkedRenderListItemsChunksBuildResult } from './chunked-render-list-items-chunks-build-result';

export function buildChunksForFullRerender<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
>(
  getNewChunkId: () => string,
  chunkSize: number,
  modificationRepresentation: MT,
): ChunkedRenderListItemsChunksBuildResult<IT> {
  const chunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  const children = modificationRepresentation.children;

  const allChunksCount = children.length / chunkSize;
  const ceilChunksCount = Math.floor(allChunksCount);

  const iMax = ceilChunksCount + (allChunksCount === ceilChunksCount ? 0 : 1);
  for (let i = 0; i !== iMax; i += 1) {
    chunks.push(
      createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        children.slice(
          chunkSize * i,
          chunkSize * (i + 1),
        ),
      ),
    );
  }
  return {
    chunks,
    chunksForRender: chunks.length !== 0 ? [chunks[0]] : [],
  };
}

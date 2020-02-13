import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsModification } from '../chunked-render-list-items-modification';
import { ChunkedRenderListItemsChunksBuildResult } from './chunked-render-list-items-chunks-build-result';
import { buildChunksFromItems } from './build-chunks-from-items';

export function buildChunksForFullRerender<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
>(
  getNewChunkId: () => string,
  chunkSize: number,
  modificationRepresentation: MT,
): ChunkedRenderListItemsChunksBuildResult<IT> {
  const chunks = buildChunksFromItems(
    modificationRepresentation.children,
    getNewChunkId,
    chunkSize,
  );

  return {
    chunks,
    chunksForRender: chunks.length !== 0 ? [chunks[0]] : [],
  };
}

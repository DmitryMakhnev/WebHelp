import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';

export interface ChunkedRenderListItemsChunksBuildResult<
  T extends ChunkedRenderListItem,
> {
  chunks: ChunkedRenderListItemsChunkModel<T>[];
  chunksForRender: ChunkedRenderListItemsChunkModel<T>[];
  // chunk for interaction:
  // – appending animation
  // – removing animation
  mainInteractionChunk?: ChunkedRenderListItemsChunkModel<T>;
  // all chunks for interaction:
  // — all appended chunks
  allInteractionChunks?: ChunkedRenderListItemsChunkModel<T>[];
}

import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsModification } from '../chunked-render-list-items-modification';
import { ChunkedRenderListItemsChunksBuildResult } from './chunked-render-list-items-chunks-build-result';
import {
  ChunkedRenderListItemsChunkModel,
  createChunkedRenderListItemsChunkModel,
} from './chunked-render-list-items-chunk-model';
import { buildChunksFromItems } from './build-chunks-from-items';
import { notLessThan } from '../../../../lib/numbers/not-less-than';

export function buildChunksForIndependentPartRender<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
  >(
  getNewChunkId: () => string,
  chunkSize: number,
  modificationRepresentation: MT,
): ChunkedRenderListItemsChunksBuildResult<IT> {
  const children = modificationRepresentation.children;
  const bearingItemId = modificationRepresentation.bearingItemId as string;

  const indexOfFirstItemMainInteractionChunk = children.findIndex(
    item => item.id === bearingItemId,
  );

  // find items for chunks
  const indexOfLastItemOfMainInteractionChunk = indexOfFirstItemMainInteractionChunk + chunkSize;
  const mainInteractionChunkItems = children.slice(
    indexOfFirstItemMainInteractionChunk,
    indexOfLastItemOfMainInteractionChunk,
  );

  // fix for not negative number value for slice
  const indexOfFirstItemOfFirstChunkForRender = notLessThan(
    indexOfFirstItemMainInteractionChunk - chunkSize,
    0,
  );
  const itemsOfRenderChunkBeforeMainInteractionChunk = children.slice(
    indexOfFirstItemOfFirstChunkForRender,
    indexOfFirstItemMainInteractionChunk,
  );

  const indexOfLastItemForLastChunkForRender = indexOfLastItemOfMainInteractionChunk + chunkSize;
  const itemsOfRenderChunkAfterMainInteractionChunk = children.slice(
    indexOfLastItemOfMainInteractionChunk,
    indexOfLastItemForLastChunkForRender,
  );

  const itemsForChunksBeforeChunksForRender = children.slice(
    0,
    indexOfFirstItemOfFirstChunkForRender,
  );

  const itemsForChunkAfterChunksForRender = children.slice(
    indexOfLastItemForLastChunkForRender,
  );

  // build chunks for render
  const chunksForRender: ChunkedRenderListItemsChunkModel<IT>[] = [];
  if (itemsOfRenderChunkBeforeMainInteractionChunk.length !== 0) {
    chunksForRender.push(
      createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        itemsOfRenderChunkBeforeMainInteractionChunk,
      ),
    );
  }
  const mainInteractionChunk = createChunkedRenderListItemsChunkModel(
    getNewChunkId(),
    mainInteractionChunkItems,
  );
  chunksForRender.push(mainInteractionChunk);
  if (itemsOfRenderChunkAfterMainInteractionChunk.length !== 0) {
    chunksForRender.push(
      createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        itemsOfRenderChunkAfterMainInteractionChunk,
      ),
    );
  }

  // build all chunks
  const chunksBeforeChunksForRender = buildChunksFromItems(
    itemsForChunksBeforeChunksForRender,
    getNewChunkId,
    chunkSize,
  );

  const chunksAfterChunksForRender = buildChunksFromItems(
    itemsForChunkAfterChunksForRender,
    getNewChunkId,
    chunkSize,
  );

  const chunks: ChunkedRenderListItemsChunkModel<IT>[] = chunksBeforeChunksForRender
    .concat(
      chunksForRender,
      chunksAfterChunksForRender,
    );

  return {
    chunks,
    chunksForRender,
    mainInteractionChunk,
  };
}

import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsModification } from '../chunked-render-list-items-modification';
import { ChunkedRenderListItemsChunksBuildResult } from './chunked-render-list-items-chunks-build-result';
import {
  ChunkedRenderListItemsChunkModel,
  createChunkedRenderListItemsChunkModel,
} from './chunked-render-list-items-chunk-model';

export function buildChunksForAppendRender<IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
  >(
  getNewChunkId: () => string,
  chunkSize: number,
  prevRenderedChunks: ChunkedRenderListItemsChunkModel<IT>[],
  prevAllChunks: ChunkedRenderListItemsChunkModel<IT>[],
  modificationRepresentation: MT,
): ChunkedRenderListItemsChunksBuildResult<IT> {
  // find not rendered chunks
  const firstRenderedChunk = prevRenderedChunks[0];
  const lastRenderedChunk = prevRenderedChunks[prevRenderedChunks.length - 1];
  const indexOfFirstRenderedChunk = prevAllChunks.findIndex(
    chunk => chunk.id === firstRenderedChunk.id,
  );
  const indexOfLastRenderedChunk = prevAllChunks.findIndex(
    chunk => chunk.id === lastRenderedChunk.id,
  );
  const notRenderedChunksBeforeRenderedChunks = prevAllChunks.slice(0, indexOfFirstRenderedChunk);
  const notRenderedChunksAfterRenderedChunks = prevAllChunks.slice(
    indexOfLastRenderedChunk + 2, prevAllChunks.length,
  );

  // find chunks before and after rendered
  const itemAfterAppendIs = modificationRepresentation.bearingItemId as string;
  const indexOfChunkWhereAppendIs = prevRenderedChunks.findIndex(
    chunk => chunk.itemIndexesById.has(itemAfterAppendIs),
  );
  const renderedChunksBeforeChunkWithAppend = prevRenderedChunks.slice(
    0,
    indexOfChunkWhereAppendIs,
  );
  const renderedChunksAfterChunkWithAppend = prevRenderedChunks.slice(
    indexOfChunkWhereAppendIs + 1,
    prevRenderedChunks.length,
  );

  // rebuild chunk where append is
  const chunkWhereAppendIs = prevRenderedChunks[indexOfChunkWhereAppendIs];
  const indexOfItemForAddingInChunk = chunkWhereAppendIs.items.findIndex(
    item => item.id === itemAfterAppendIs,
  );
  const newChunkWithItemsBeforeAppend = createChunkedRenderListItemsChunkModel(
    getNewChunkId(),
    chunkWhereAppendIs.items.slice(0, indexOfItemForAddingInChunk + 1),
  );
  const newChunkWithItemsAfterItemForAppend = createChunkedRenderListItemsChunkModel(
    getNewChunkId(),
    chunkWhereAppendIs.items.slice(
      indexOfItemForAddingInChunk + 1,
      chunkWhereAppendIs.items.length,
    ),
  );

  // build chunks for appended items
  const chunksForAppendedChildren: ChunkedRenderListItemsChunkModel<IT>[] = [];
  const appendedChildren = modificationRepresentation.modifyingChildren;
  const allAppendChunksCount = appendedChildren.length / chunkSize;
  const ceilAppendChunksCount = Math.floor(allAppendChunksCount);
  const iMax = ceilAppendChunksCount + (allAppendChunksCount !== ceilAppendChunksCount ? 1 : 0);
  for (let i = 0; i !== iMax; i += 1) {
    chunksForAppendedChildren.push(
      createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        appendedChildren.slice(
          chunkSize * i,
          chunkSize * (i + 1),
        ),
      ),
    );
  }

  // combine all chunks
  const allNewChunks = notRenderedChunksBeforeRenderedChunks
    .concat(
      renderedChunksBeforeChunkWithAppend,
      newChunkWithItemsBeforeAppend,
      chunksForAppendedChildren,
      newChunkWithItemsAfterItemForAppend,
      renderedChunksAfterChunkWithAppend,
      notRenderedChunksAfterRenderedChunks,
    );

  // combine all rendered chunks
  let allRenderedChunks;
  if (chunksForAppendedChildren.length === 1) {
    allRenderedChunks = renderedChunksBeforeChunkWithAppend
      .concat(
        newChunkWithItemsBeforeAppend,
        chunksForAppendedChildren,
        newChunkWithItemsAfterItemForAppend,
        renderedChunksAfterChunkWithAppend,
      );
  } else {
    allRenderedChunks = renderedChunksBeforeChunkWithAppend
      .concat(
        newChunkWithItemsBeforeAppend,
        chunksForAppendedChildren[0],

        // in this place we have render hole
        // it's hole for building animation
        // and we must process this hole during renderer after animation

        newChunkWithItemsAfterItemForAppend,
        renderedChunksAfterChunkWithAppend,
      );
  }

  return {
    chunksForRender: allRenderedChunks,
    chunks: allNewChunks,
    mainInteractionChunk: chunksForAppendedChildren[0],
    allInteractionChunks: chunksForAppendedChildren,
  };
}

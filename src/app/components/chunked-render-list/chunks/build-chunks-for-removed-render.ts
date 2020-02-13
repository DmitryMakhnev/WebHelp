import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { ChunkedRenderListItemsModification } from '../chunked-render-list-items-modification';
import { ChunkedRenderListItemsChunksBuildResult } from './chunked-render-list-items-chunks-build-result';
import {
  ChunkedRenderListItemsChunkModel,
  createChunkedRenderListItemsChunkModel,
} from './chunked-render-list-items-chunk-model';
import { createChunkId } from './chunk-id-factory';

function resolveChunkWithItemAfterRemoving<IT extends ChunkedRenderListItem>(
  chunks: ChunkedRenderListItemsChunkModel<IT>[],
  indexInChunks: number,
  itemAfterRemovingId: string,
  getNewChunkId: () => string,
): ChunkedRenderListItemsChunkModel<IT> {
  const chunkWithItemAfterRemoving = chunks[indexInChunks];
  const indexOfItemAfterRemovingInChunk = chunkWithItemAfterRemoving
    .itemIndexesById.get(itemAfterRemovingId);
  if (indexOfItemAfterRemovingInChunk === 0) {
    return chunkWithItemAfterRemoving;
  }

  return createChunkedRenderListItemsChunkModel(
    getNewChunkId(),
    chunkWithItemAfterRemoving.items.slice(
      indexOfItemAfterRemovingInChunk,
    ),
  );
}

export function buildChunksForRemovedRerender<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
  >(
  getNewChunkId: () => string,
  chunkSize: number,
  prevRenderedChunks: ChunkedRenderListItemsChunkModel<IT>[],
  prevAllChunks: ChunkedRenderListItemsChunkModel<IT>[],
  modificationRepresentation: MT,
): ChunkedRenderListItemsChunksBuildResult<IT> {
  const itemBeforeRemovingId = modificationRepresentation.bearingItemId as string;

  // find chunk with item before removing
  const indexOfChunkWithItemBeforeRemoving = prevRenderedChunks.findIndex(
    chunk => chunk.itemIndexesById.has(itemBeforeRemovingId),
  );
  const chunkWithItemBeforeRemoving = prevRenderedChunks[indexOfChunkWithItemBeforeRemoving];

  // check rebuilding of chunk is required
  const lastItemInChunkWithItemBeforeRemoving = chunkWithItemBeforeRemoving
    .items[chunkWithItemBeforeRemoving.items.length - 1];
  const isRequiredToRebuildChunkWithItemBeforeRemoving = lastItemInChunkWithItemBeforeRemoving.id
    !== itemBeforeRemovingId;

  // resolve chunk with item before removing
  let resultChunkWithItemBeforeRemoving: ChunkedRenderListItemsChunkModel<IT>;
  if (isRequiredToRebuildChunkWithItemBeforeRemoving) {
    resultChunkWithItemBeforeRemoving = createChunkedRenderListItemsChunkModel(
      createChunkId(),
      chunkWithItemBeforeRemoving.items.slice(
        0,
        chunkWithItemBeforeRemoving.itemIndexesById.get(itemBeforeRemovingId) as number + 1,
      ),
    );
  } else {
    resultChunkWithItemBeforeRemoving = chunkWithItemBeforeRemoving;
  }

  // resolve chunk after removing
  let resultChunkWithItemAfterRemoving: ChunkedRenderListItemsChunkModel<IT>|undefined;

  const chunkWithItemsAfterRemovingWasFoundInChunkWithItemBefore = 1;
  const chunkWithItemsAfterRemovingWasFoundInChunksForRender = 2;
  const chunkWithItemsAfterRemovingWasFoundInChunks = 3;
  let chunkWithItemsAfterRemovingWasFoundIn = -1;
  let chunkWithItemsAfterRemovingIndex = -1;

  // understand that we have items after removed
  const allResultItems = modificationRepresentation.children;
  const hasItemAfterRemovedItems = allResultItems[allResultItems.length - 1]
    .id !== itemBeforeRemovingId;

  if (hasItemAfterRemovedItems) {
    // resolve id of item after removing
    const indexOfItemBeforeRemovingInAllItems = allResultItems
      .findIndex(item => item.id === itemBeforeRemovingId);
    const indexOfItemAfterRemovingInAllItems = indexOfItemBeforeRemovingInAllItems + 1;
    const itemAfterRemoving = allResultItems[indexOfItemAfterRemovingInAllItems];
    const itemAfterRemovingId = itemAfterRemoving.id;

    // check item after removing in chunk with item before
    const isChunkWithItemBeforeContainsItemAfter = chunkWithItemBeforeRemoving
      .itemIndexesById.has(itemAfterRemovingId);

    if (isChunkWithItemBeforeContainsItemAfter) {
      resultChunkWithItemAfterRemoving = createChunkedRenderListItemsChunkModel(
        getNewChunkId(),
        chunkWithItemBeforeRemoving.items.slice(
          chunkWithItemBeforeRemoving.itemIndexesById.get(itemAfterRemovingId),
        ),
      );
      // eslint-disable-next-line max-len
      chunkWithItemsAfterRemovingWasFoundIn = chunkWithItemsAfterRemovingWasFoundInChunkWithItemBefore;
      chunkWithItemsAfterRemovingIndex = indexOfChunkWithItemBeforeRemoving;
    } else {
      // try to find chunk with item after removing in rendered chunks
      const indexOfChunkWithItemAfterRemoving = prevRenderedChunks.findIndex(
        chunk => chunk.itemIndexesById.has(itemAfterRemovingId),
      );

      if (indexOfChunkWithItemAfterRemoving !== -1) {
        resultChunkWithItemAfterRemoving = resolveChunkWithItemAfterRemoving(
          prevRenderedChunks,
          indexOfChunkWithItemAfterRemoving,
          itemAfterRemovingId,
          getNewChunkId,
        );
        // eslint-disable-next-line max-len
        chunkWithItemsAfterRemovingWasFoundIn = chunkWithItemsAfterRemovingWasFoundInChunksForRender;
        chunkWithItemsAfterRemovingIndex = indexOfChunkWithItemAfterRemoving;
      } else {
        // we go to the end :)
        // find chunk with item after removing in the all chunks
        const indexOfChunkWithItemAfterRemovingInAllChunks = prevAllChunks.findIndex(
          chunk => chunk.itemIndexesById.has(itemAfterRemovingId),
        );
        resultChunkWithItemAfterRemoving = resolveChunkWithItemAfterRemoving(
          prevAllChunks,
          indexOfChunkWithItemAfterRemovingInAllChunks,
          itemAfterRemovingId,
          getNewChunkId,
        );
        chunkWithItemsAfterRemovingWasFoundIn = chunkWithItemsAfterRemovingWasFoundInChunks;
        chunkWithItemsAfterRemovingIndex = indexOfChunkWithItemAfterRemovingInAllChunks;
      }
    }
  }

  // build first removing chunk
  const removingChunk = createChunkedRenderListItemsChunkModel(
    getNewChunkId(),
    modificationRepresentation.modifyingChildren.slice(0, chunkSize),
  );

  // combine all chunks
  // find not rendered chunks before rendered chunks
  const firstRenderedChunk = prevRenderedChunks[0];
  const indexOfFirstRenderedChunk = prevAllChunks.findIndex(
    chunk => chunk.id === firstRenderedChunk.id,
  );
  const notRenderedChunksBeforeRenderedChunks = prevAllChunks.slice(0, indexOfFirstRenderedChunk);

  // fin rendered chunks before
  const renderedChunksBeforeChunkWithItemBeforeRemoving = prevRenderedChunks
    .slice(0, indexOfChunkWithItemBeforeRemoving);

  let renderedChunksAfterRemoving: ChunkedRenderListItemsChunkModel<IT>[];
  let notRenderedChunksAfterRenderedChunks: ChunkedRenderListItemsChunkModel<IT>[];

  switch (chunkWithItemsAfterRemovingWasFoundIn) {
    case chunkWithItemsAfterRemovingWasFoundInChunkWithItemBefore:
    case chunkWithItemsAfterRemovingWasFoundInChunksForRender:
      renderedChunksAfterRemoving = prevRenderedChunks.slice(
        chunkWithItemsAfterRemovingIndex + 1,
      );
      notRenderedChunksAfterRenderedChunks = prevAllChunks.slice(
        prevAllChunks.findIndex(
          chunk => chunk.id === prevRenderedChunks[prevRenderedChunks.length - 1].id,
        ) + 1,
      );
      break;
    case chunkWithItemsAfterRemovingWasFoundInChunks:
      renderedChunksAfterRemoving = [];
      notRenderedChunksAfterRenderedChunks = prevAllChunks.slice(
        chunkWithItemsAfterRemovingIndex + 1,
      );
      break;
    default:
      renderedChunksAfterRemoving = [];
      notRenderedChunksAfterRenderedChunks = [];
  }

  // build result chunks
  const allChunksForRender =
    renderedChunksBeforeChunkWithItemBeforeRemoving.concat(
      resultChunkWithItemBeforeRemoving,
      hasItemAfterRemovedItems ?
        resultChunkWithItemAfterRemoving as ChunkedRenderListItemsChunkModel<IT>
        : [],
      renderedChunksAfterRemoving,
    );

  const allNewChunks = notRenderedChunksBeforeRenderedChunks
    .concat(
      allChunksForRender,
      notRenderedChunksAfterRenderedChunks,
    );

  return {
    chunks: allNewChunks,
    chunksForRender: allChunksForRender,
    mainInteractionChunk: removingChunk,
  };
}

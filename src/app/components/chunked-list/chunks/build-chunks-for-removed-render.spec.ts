import { ChunkedListItem } from '../types/chunked-list-item';
import { createItemsForRemoving, ItemsForRemovingCreationResult } from './test-utils/create-items-for-removing';
import { createInitialChunksData } from './test-utils/create-initial-chunks-data';
import { buildChunksForRemovedRerender } from './build-chunks-for-removed-render';
import { createChunkId } from './create-chunk-id';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';
import { getMapKesAsArray } from '../../../../lib/test-utils/get-map-keys-as-array';
import { getIdsOfItemsAsArray } from './test-utils/get-ids-of-items-as-array';

const REMOVED_PREFIX = 'removed_';

const commonItems = createItemsForRemoving(
  {
    from: 1,
    to: 2,
  },
  {
    from: 3,
    to: 4,
    prefix: REMOVED_PREFIX,
  },
  {
    from: 5,
    to: 6,
  },
);

function createRemovedData(
  items: ItemsForRemovingCreationResult,
  chunkSize: number,
  prepareChunksForRender: (
    initialChunksForRender: ChunkedRenderListItemsChunkModel<ChunkedListItem>[],
    initialChunks: ChunkedRenderListItemsChunkModel<ChunkedListItem>[],
  ) => ChunkedRenderListItemsChunkModel<ChunkedListItem>[]
    = initialChunksForRender => initialChunksForRender,
) {
  const initialResult = createInitialChunksData(
    items.all,
    chunkSize,
  );
  const removingChunksResult = buildChunksForRemovedRerender(
    createChunkId,
    chunkSize,
    // emulation of results of UI actions
    prepareChunksForRender(
      initialResult.initialChunks.chunksForRender,
      initialResult.initialChunks.chunks,
    ),
    initialResult.initialChunks.chunks,
    {
      modificationType: 'CHILDREN_REMOVED',
      children: items.notRemoved,
      modifyingChildren: items.removed,
      bearingItemId: items.before[items.before.length - 1].id,
    },
  );
  return {
    initialResult,
    removingChunksResult,
  };
}

describe('buildChunksForRemovedRerender', () => {
  describe('remove full separated chunk', () => {
    describe('when all chunks rendered', () => {
      function createRemovedDataWhenAllChunksRendered() {
        return createRemovedData(
          commonItems,
          2,
          (chunksForRender, chunks) => chunks,
        );
      }
      it('chunks are correct', () => {
        const createdRemovingData = createRemovedDataWhenAllChunksRendered();
        const initialChunks = createdRemovingData.initialResult.initialChunks.chunks;
        const removingChunksResult = createdRemovingData.removingChunksResult;
        const chunksAfterRemoving = removingChunksResult.chunks;
        expect(chunksAfterRemoving.length).toBe(2);
        expect(chunksAfterRemoving[0]).toBe(initialChunks[0]);
        expect(
          getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
        ).toEqual(['1', '2']);
        expect(chunksAfterRemoving[1]).toBe(initialChunks[2]);
        expect(
          getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
        ).toEqual(['5', '6']);
      });
      it('chunks ror render are correct', () => {
        const createdRemovingData = createRemovedDataWhenAllChunksRendered();
        const initialChunks = createdRemovingData.initialResult.initialChunks.chunks;
        const removingChunksResult = createdRemovingData.removingChunksResult;
        const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
        expect(chunksForRenderAfterRemoving.length).toBe(2);
        expect(chunksForRenderAfterRemoving[0]).toBe(initialChunks[0]);
        expect(
          getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
        ).toEqual(['1', '2']);
        expect(
          getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
        ).toEqual(['5', '6']);
        expect(chunksForRenderAfterRemoving[1]).toBe(initialChunks[2]);
      });
      it('main interaction chunk is correct', () => {
        const removingChunksResult = createRemovedDataWhenAllChunksRendered().removingChunksResult;
        const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
          ChunkedRenderListItemsChunkModel<ChunkedListItem>;
        expect(mainInteractionChunk).toBeDefined();
        expect(mainInteractionChunk.items.length).toBe(2);
        expect(
          getIdsOfItemsAsArray(mainInteractionChunk.items),
        ).toEqual([`${REMOVED_PREFIX}3`, `${REMOVED_PREFIX}4`]);
      });
    });
    describe('when rendered only chunk before removing and chunk with removed', () => {
      function createRemoveDataWhenRenderedOnlyChunkBeforeRemovingAndChunkWithRemoved() {
        return createRemovedData(
          commonItems,
          2,
          (chunksForRender, chunks) => chunksForRender.concat(chunks[1]),
        );
      }

      it('chunks are correct', () => {
        // eslint-disable-next-line max-len
        const removedData = createRemoveDataWhenRenderedOnlyChunkBeforeRemovingAndChunkWithRemoved();
        const removingChunksResult = removedData.removingChunksResult;
        const chunksAfterRemoving = removingChunksResult.chunks;
        expect(chunksAfterRemoving.length).toBe(2);
        expect(
          getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
        ).toEqual(['1', '2']);
        expect(
          getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
        ).toEqual(['5', '6']);
      });
      it('chunks ror render are correct', () => {
        // eslint-disable-next-line max-len
        const removedData = createRemoveDataWhenRenderedOnlyChunkBeforeRemovingAndChunkWithRemoved();
        const removingChunksResult = removedData.removingChunksResult;
        const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
        expect(chunksForRenderAfterRemoving.length).toBe(2);
        expect(
          getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
        ).toEqual(['1', '2']);
        expect(
          getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
        ).toEqual(['5', '6']);
      });
      it('main interaction chunk is correct', () => {
        // eslint-disable-next-line max-len
        const removedData = createRemoveDataWhenRenderedOnlyChunkBeforeRemovingAndChunkWithRemoved();
        const removingChunksResult = removedData.removingChunksResult;
        const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
          ChunkedRenderListItemsChunkModel<ChunkedListItem>;
        expect(mainInteractionChunk).toBeDefined();
        expect(mainInteractionChunk.items.length).toBe(2);
        expect(
          getIdsOfItemsAsArray(mainInteractionChunk.items),
        ).toEqual([`${REMOVED_PREFIX}3`, `${REMOVED_PREFIX}4`]);
      });
    });
  });
  describe('remove from one chunk', () => {
    function createRemovedDataForRemoveFromOneChunk() {
      return createRemovedData(
        commonItems,
        6,
      );
    }

    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemoveFromOneChunk();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
      ).toEqual(['5', '6']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemoveFromOneChunk();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
      ).toEqual(['5', '6']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemoveFromOneChunk();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}3`, `${REMOVED_PREFIX}4`]);
    });
  });

  describe('remove from 3 chunks', () => {
    function createRemovedDataForRemoveFrom3Chunks() {
      return createRemovedData(
        createItemsForRemoving(
          {
            from: 1,
            to: 1,
          },
          {
            from: 2,
            to: 5,
            prefix: REMOVED_PREFIX,
          },
          {
            from: 6,
            to: 6,
          },
        ),
        2,
        (chunksForRender, chunks) => chunks,
      );
    }
    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemoveFrom3Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
      ).toEqual(['6']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemoveFrom3Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['1']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
      ).toEqual(['6']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemoveFrom3Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}2`, `${REMOVED_PREFIX}3`]);
    });
  });
  describe('remove 2 chunks', () => {
    function createRemovedDataForRemove2Chunks() {
      return createRemovedData(
        createItemsForRemoving(
          {
            from: 1,
            to: 2,
          },
          {
            from: 3,
            to: 6,
            prefix: REMOVED_PREFIX,
          },
          {
            from: 7,
            to: 8,
          },
        ),
        2,
        (chunksForRender, chunks) => chunks,
      );
    }

    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemove2Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
      ).toEqual(['7', '8']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemove2Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(2);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
      ).toEqual(['7', '8']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemove2Chunks();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}3`, `${REMOVED_PREFIX}4`]);
    });
  });
  describe('remove from last chunks', () => {
    function createRemovedDataForRemoveFromLastChunks() {
      return createRemovedData(
        createItemsForRemoving(
          {
            from: 1,
            to: 2,
          },
          {
            from: 3,
            to: 4,
            prefix: REMOVED_PREFIX,
          },
        ),
        2,
        (chunksForRender, chunks) => chunks,
      );
    }

    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemoveFromLastChunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(1);
      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemoveFromLastChunks();
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(1);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemoveFromLastChunks();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}3`, `${REMOVED_PREFIX}4`]);
    });
  });
  describe('remove with some not rendered chunks', () => {
    function createRemovedDataForRemoveWithSomeNotRenderedChunks() {
      return createRemovedData(
        createItemsForRemoving(
          {
            from: 1,
            to: 4,
          },
          {
            from: 5,
            to: 6,
            prefix: REMOVED_PREFIX,
          },
          {
            from: 7,
            to: 10,
          },
        ),
        2,
        (chunksForRender, chunks) => chunks.slice(1, 4),
      );
    }

    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeNotRenderedChunks();
      const initialChunks = removedData.initialResult.initialChunks.chunks;
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(4);

      expect(chunksAfterRemoving[0]).toBe(initialChunks[0]);
      expect(chunksAfterRemoving[1]).toBe(initialChunks[1]);
      expect(chunksAfterRemoving[2]).toBe(initialChunks[3]);
      expect(chunksAfterRemoving[3]).toBe(initialChunks[4]);

      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
      ).toEqual(['3', '4']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[2].itemIndexesById),
      ).toEqual(['7', '8']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[3].itemIndexesById),
      ).toEqual(['9', '10']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeNotRenderedChunks();
      const initialChunks = removedData.initialResult.initialChunks.chunks;
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(2);

      expect(chunksForRenderAfterRemoving[0]).toBe(initialChunks[1]);
      expect(chunksForRenderAfterRemoving[1]).toBe(initialChunks[3]);

      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['3', '4']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
      ).toEqual(['7', '8']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeNotRenderedChunks();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}5`, `${REMOVED_PREFIX}6`]);
    });
  });
  describe('remove with some extra rendered chunks', () => {
    function createRemovedDataForRemoveWithSomeExtraRenderedChunks() {
      return createRemovedData(
        createItemsForRemoving(
          {
            from: 1,
            to: 6,
          },
          {
            from: 7,
            to: 8,
            prefix: REMOVED_PREFIX,
          },
          {
            from: 9,
            to: 14,
          },
        ),
        2,
        (chunksForRender, chunks) => chunks.slice(1, 6),
      );
    }

    it('chunks are correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeExtraRenderedChunks();
      const initialChunks = removedData.initialResult.initialChunks.chunks;
      const removingChunksResult = removedData.removingChunksResult;
      const chunksAfterRemoving = removingChunksResult.chunks;
      expect(chunksAfterRemoving.length).toBe(6);

      expect(chunksAfterRemoving[0]).toBe(initialChunks[0]);
      expect(chunksAfterRemoving[1]).toBe(initialChunks[1]);
      expect(chunksAfterRemoving[2]).toBe(initialChunks[2]);
      expect(chunksAfterRemoving[3]).toBe(initialChunks[4]);
      expect(chunksAfterRemoving[4]).toBe(initialChunks[5]);
      expect(chunksAfterRemoving[5]).toBe(initialChunks[6]);

      expect(
        getMapKesAsArray(chunksAfterRemoving[0].itemIndexesById),
      ).toEqual(['1', '2']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[1].itemIndexesById),
      ).toEqual(['3', '4']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[2].itemIndexesById),
      ).toEqual(['5', '6']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[3].itemIndexesById),
      ).toEqual(['9', '10']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[4].itemIndexesById),
      ).toEqual(['11', '12']);
      expect(
        getMapKesAsArray(chunksAfterRemoving[5].itemIndexesById),
      ).toEqual(['13', '14']);
    });
    it('chunks ror render are correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeExtraRenderedChunks();
      const initialChunks = removedData.initialResult.initialChunks.chunks;
      const removingChunksResult = removedData.removingChunksResult;
      const chunksForRenderAfterRemoving = removingChunksResult.chunksForRender;
      expect(chunksForRenderAfterRemoving.length).toBe(4);

      expect(chunksForRenderAfterRemoving[0]).toBe(initialChunks[1]);
      expect(chunksForRenderAfterRemoving[1]).toBe(initialChunks[2]);

      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[0].itemIndexesById),
      ).toEqual(['3', '4']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[1].itemIndexesById),
      ).toEqual(['5', '6']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[2].itemIndexesById),
      ).toEqual(['9', '10']);
      expect(
        getMapKesAsArray(chunksForRenderAfterRemoving[3].itemIndexesById),
      ).toEqual(['11', '12']);
    });
    it('main interaction chunk is correct', () => {
      const removedData = createRemovedDataForRemoveWithSomeExtraRenderedChunks();
      const removingChunksResult = removedData.removingChunksResult;
      const mainInteractionChunk = removingChunksResult.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(mainInteractionChunk.items.length).toBe(2);
      expect(
        getIdsOfItemsAsArray(mainInteractionChunk.items),
      ).toEqual([`${REMOVED_PREFIX}7`, `${REMOVED_PREFIX}8`]);
    });
  });
});

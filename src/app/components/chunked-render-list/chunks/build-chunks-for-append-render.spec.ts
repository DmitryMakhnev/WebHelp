import { buildChunksForAppendRender } from './build-chunks-for-append-render';
import { createChunkId } from './chunk-id-factory';
import { createItems } from './test-tuils/create-items';
import { ChunkedRenderListItem } from '../chunked-render-list-item';
import { getMapKesAsArray } from '../../../../lib/test-utils/get-map-keys-as-array';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';
import { DEFAULT_CHUNK_SIZE_FOR_TESTS } from './test-tuils/build-chunks-test-consts';
import { CreatedInitialChunksDataResult, createInitialChunksData } from './test-tuils/create-initial-chunks-data';
import { getIdsOfItemsAsArray } from './test-tuils/get-ids-of-items-as-array';

const APPENDED_PREFIX = 'appended_';

function createAppendedData(
  from: number,
  to: number,
  prefix: string,
  afterItemId: string,
  createdInitialResult: CreatedInitialChunksDataResult,
  chunkSize = DEFAULT_CHUNK_SIZE_FOR_TESTS,
) {
  const appendedItems = createItems(from, to, prefix);
  const prevItems = createdInitialResult.items;
  const afterItemPrefix = prevItems.findIndex(item => item.id === afterItemId);
  const allItems = prevItems.slice(0, afterItemPrefix + 1)
    .concat(
      appendedItems,
      prevItems.slice(afterItemPrefix + 1, prevItems.length),
    );
  return {
    allItems,
    appendedItems,
    resultChunks: buildChunksForAppendRender(
      createChunkId,
      chunkSize,
      createdInitialResult.initialChunks.chunksForRender,
      createdInitialResult.initialChunks.chunks,
      {
        modificationType: 'CHILDREN_APPENDED',
        children: allItems,
        modifyingChildren: appendedItems,
        bearingItemId: afterItemId,
      },
    ),
    createdInitialResult,
  };
}

function appendInOneRenderedChunkItemsCountWhichIsLessThanChunkCount() {
  const createdInitialResult = createInitialChunksData(
    {
      from: 1,
      to: 2,
    },
  );
  const firstItem = createdInitialResult.items[0];
  return createAppendedData(
    1,
    2,
    APPENDED_PREFIX,
    firstItem.id,
    createdInitialResult,
  );
}

function appendInOneRenderedChunkItemsCountWhichIsMoreThanChunkCount() {
  const createdInitialResult = createInitialChunksData(
    {
      from: 1,
      to: 2,
    },
    2,
  );
  const firstItem = createdInitialResult.items[0];
  return createAppendedData(
    1,
    3,
    APPENDED_PREFIX,
    firstItem.id,
    createdInitialResult,
    2,
  );
}

function appendInNotFirstButLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount() {
  const createdInitialResult = createInitialChunksData(
    {
      from: 1,
      to: 6,
    },
    2,
  );

  // render all chunks
  const initialChunks = createdInitialResult.initialChunks;
  initialChunks.chunksForRender = initialChunks.chunks;

  const fistItemOfThirdChunk = initialChunks.chunksForRender[2].items[0];
  return createAppendedData(
    1,
    2,
    APPENDED_PREFIX,
    fistItemOfThirdChunk.id,
    createdInitialResult,
    2,
  );
}

function appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount() {
  const createdInitialResult = createInitialChunksData(
    {
      from: 1,
      to: 6,
    },
    2,
  );

  // render all chunks
  const initialChunks = createdInitialResult.initialChunks;
  initialChunks.chunksForRender = initialChunks.chunks;

  const fistItemOfThirdChunk = initialChunks.chunksForRender[1].items[0];
  return createAppendedData(
    1,
    2,
    APPENDED_PREFIX,
    fistItemOfThirdChunk.id,
    createdInitialResult,
    2,
  );
}

function appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsMoreThanChunkCount() {
  const createdInitialResult = createInitialChunksData(
    {
      from: 1,
      to: 6,
    },
    2,
  );

  // render all chunks
  const initialChunks = createdInitialResult.initialChunks;
  initialChunks.chunksForRender = initialChunks.chunks;

  const fistItemOfThirdChunk = initialChunks.chunksForRender[1].items[0];
  return createAppendedData(
    1,
    3,
    APPENDED_PREFIX,
    fistItemOfThirdChunk.id,
    createdInitialResult,
    2,
  );
}

describe('buildChunksForAppendRender', () => {
  describe('correct data in fixtures', () => {
    it('result items are correct', () => {
      const createdInitialResult = createInitialChunksData({
        from: 1,
        to: 2,
      });
      const firstItem = createdInitialResult.items[0];
      const appendedData = createAppendedData(
        1,
        2,
        APPENDED_PREFIX,
        firstItem.id,
        createdInitialResult,
      );
      const resultAllIds = getIdsOfItemsAsArray(appendedData.allItems);
      expect(resultAllIds).toEqual(['1', `${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`, '2']);
      expect(resultAllIds).toEqual(['1', `${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`, '2']);
    });
    it('appended items are correct', () => {
      const createdInitialResult = createInitialChunksData({
        from: 1,
        to: 2,
      });
      const firstItem = createdInitialResult.items[0];
      const appendedData = createAppendedData(
        1,
        2,
        APPENDED_PREFIX,
        firstItem.id,
        createdInitialResult,
      );
      const appendItemIds = getIdsOfItemsAsArray(appendedData.appendedItems);
      expect(appendItemIds).toEqual([`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`]);
    });
  });
  describe('append in one rendered chunk items count which is less than chunk count', () => {
    it('rendered chunks contain chunk with item before children,' +
      'chunk of appended children and chunk items after children', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsLessThanChunkCount();
      const resultChunksForRender = appendedData.resultChunks.chunksForRender;

      const firstChunkForRender = resultChunksForRender[0];
      expect(getMapKesAsArray(firstChunkForRender.itemIndexesById)).toEqual(['1']);

      const secondChunkForRender = resultChunksForRender[1];
      expect(
        getMapKesAsArray(secondChunkForRender.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );

      const thirdChunkForRender = resultChunksForRender[2];
      expect(getMapKesAsArray(thirdChunkForRender.itemIndexesById)).toEqual(['2']);
    });

    it('correct all chunks', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsLessThanChunkCount();
      const resultAllChunks = appendedData.resultChunks.chunks;

      const firstChunk = resultAllChunks[0];
      expect(getMapKesAsArray(firstChunk.itemIndexesById)).toEqual(['1']);

      const secondChunk = resultAllChunks[1];
      expect(
        getMapKesAsArray(secondChunk.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );

      const thirdChunk = resultAllChunks[2];
      expect(getMapKesAsArray(thirdChunk.itemIndexesById)).toEqual(['2']);
    });

    it('correct interaction chunk', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsLessThanChunkCount();
      const interactionChunk = appendedData.resultChunks.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>;
      expect(interactionChunk).toBeDefined();
      expect(
        getMapKesAsArray(interactionChunk.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );
    });

    it('correct all interaction chunks', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsLessThanChunkCount();
      const appendedDataResultChunks = appendedData.resultChunks;
      const allInteractionChunks = appendedDataResultChunks.allInteractionChunks as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>[];
      expect(allInteractionChunks.length).toBe(1);
      const interactionChunk = appendedDataResultChunks.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>;
      expect(allInteractionChunks[0]).toBe(interactionChunk);
    });
  });
  describe('append in one rendered chunk items count which is more than chunk count', () => {
    it('rendered chunks contain only chunk with item before children' +
      'and first chunk of appended children', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const resultChunksForRender = appendedData.resultChunks.chunksForRender;
      const firstChunkForRender = resultChunksForRender[0];
      expect(getMapKesAsArray(firstChunkForRender.itemIndexesById)).toEqual(['1']);

      const secondChunkForRender = resultChunksForRender[1];
      expect(
        getMapKesAsArray(secondChunkForRender.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );

      const thirdChunkForRender = resultChunksForRender[2];
      expect(getMapKesAsArray(thirdChunkForRender.itemIndexesById)).toEqual(['2']);
    });

    it('correct all chunks', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const resultAllChunks = appendedData.resultChunks.chunks;

      const firstChunk = resultAllChunks[0];
      expect(getMapKesAsArray(firstChunk.itemIndexesById)).toEqual(['1']);

      const secondChunk = resultAllChunks[1];
      expect(
        getMapKesAsArray(secondChunk.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );

      const thirdChunk = resultAllChunks[2];
      expect(getMapKesAsArray(thirdChunk.itemIndexesById)).toEqual([`${APPENDED_PREFIX}3`]);

      const fourthChunk = resultAllChunks[3];
      expect(getMapKesAsArray(fourthChunk.itemIndexesById)).toEqual(['2']);
    });

    it('correct interaction chunk', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const interactionChunk = appendedData.resultChunks.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>;
      expect(interactionChunk).toBeDefined();
      expect(
        getMapKesAsArray(interactionChunk.itemIndexesById),
      ).toEqual(
        [`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`],
      );
    });

    it('correct all interaction chunks', () => {
      const appendedData = appendInOneRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const appendedDataResultChunks = appendedData.resultChunks;
      const allInteractionChunks = appendedDataResultChunks.allInteractionChunks as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>[];
      expect(allInteractionChunks.length).toBe(2);
      const interactionChunk = appendedDataResultChunks.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedRenderListItem>;
      expect(allInteractionChunks[0]).toBe(interactionChunk);
      const interactionChunkIndex = appendedDataResultChunks.chunks.findIndex(
        chunk => chunk === interactionChunk,
      );
      const secondInteractionChunk = appendedDataResultChunks.chunks[interactionChunkIndex + 1];
      expect(allInteractionChunks[1]).toBe(secondInteractionChunk);
    });
  });
  describe('append in not first, but last rendered chunk', () => {
    it('previews rendered chunks without appended children were saved', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstButLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultInitialChunksChunksForRender = appendedDataResult
        .createdInitialResult.initialChunks.chunksForRender;
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(resultChunksForRender[0]).toBe(resultInitialChunksChunksForRender[0]);
      expect(resultChunksForRender[1]).toBe(resultInitialChunksChunksForRender[1]);
    });
    it('appended chunk with appending was splitted', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstButLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[2].itemIndexesById)).toEqual(['5']);
      expect(getMapKesAsArray(resultChunksForRender[4].itemIndexesById)).toEqual(['6']);
    });
    it('appended chunk was rendered', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstButLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[3].itemIndexesById))
        .toEqual([`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`]);
    });
  });
  describe('append in not first and not last rendered chunk', () => {
    it('previews rendered chunks without appended children were saved', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultInitialChunksChunksForRender = appendedDataResult
        .createdInitialResult.initialChunks.chunksForRender;
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(resultChunksForRender[0]).toBe(resultInitialChunksChunksForRender[0]);
      expect(resultChunksForRender[4]).toBe(resultInitialChunksChunksForRender[2]);
    });
    it('appended chunk with appending was splitted', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[1].itemIndexesById)).toEqual(['3']);
      expect(getMapKesAsArray(resultChunksForRender[3].itemIndexesById)).toEqual(['4']);
    });
    it('appended chunk was rendered', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsNotMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[2].itemIndexesById))
        .toEqual([`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`]);
    });
  });
  describe('append in not first and not last rendered chunk items count which is more than chunk count', () => {
    it('previews rendered chunks without appended children were saved', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const resultInitialChunksChunksForRender = appendedDataResult
        .createdInitialResult.initialChunks.chunksForRender;
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(resultChunksForRender[0]).toBe(resultInitialChunksChunksForRender[0]);
      expect(resultChunksForRender[4]).toBe(resultInitialChunksChunksForRender[2]);
    });
    it('appended chunk with appending was splitted', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[1].itemIndexesById)).toEqual(['3']);
      expect(getMapKesAsArray(resultChunksForRender[3].itemIndexesById)).toEqual(['4']);
    });
    it('appended chunk was rendered', () => {
      // eslint-disable-next-line max-len
      const appendedDataResult = appendInNotFirstAndNotLastRenderedChunkItemsCountWhichIsMoreThanChunkCount();
      const resultChunksForRender = appendedDataResult.resultChunks.chunksForRender;
      expect(getMapKesAsArray(resultChunksForRender[2].itemIndexesById))
        .toEqual([`${APPENDED_PREFIX}1`, `${APPENDED_PREFIX}2`]);
    });
  });
});

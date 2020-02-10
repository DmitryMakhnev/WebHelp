import { createItems } from './test-tuils/create-items';
import { buildChunksForFullRerender } from './build-chunks-for-full-rerender';
import { chunkIdsFactory } from './chunk-id-factory';
import { getIdsOfItems } from './test-tuils/get-ids-of-items';
import { getMapKeysAsSet } from '../../../../lib/test-utils/get-map-keys-as-set';

const TEST_CHUNK_SIZE = 10;

function createDataForTest(from: number, to: number) {
  const items = createItems(from, to);
  return {
    items,
    chunksBuildingResult: buildChunksForFullRerender(
      chunkIdsFactory,
      TEST_CHUNK_SIZE,
      {
        modificationType: 'INITIAL',
        children: items,
        modifyingChildren: items,
        bearingItemId: null,
      },
    ),
  };
}

describe('buildChunksForFullRerender', () => {
  describe('items more correct for chunks size', () => {
    const fromItem = 1;
    const toItem = 100;
    it('chunk count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunks.length).toBe(10);
    });
    it('chunks for render count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunksForRender.length).toBe(1);
    });
    it('ids in chunk for render is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(
        getMapKeysAsSet(result.chunksBuildingResult.chunksForRender[0].itemIndexesById),
      ).toEqual(
        getIdsOfItems(result.items.slice(0, 10)),
      );
    });
  });
  describe('items for 2 chunks with little second chunk', () => {
    const fromItem = 1;
    const toItem = 12;
    it('chunk count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunks.length).toBe(2);
    });
    it('chunks for render count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunksForRender.length).toBe(1);
    });
    it('ids in chunk for render is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(
        getMapKeysAsSet(result.chunksBuildingResult.chunks[1].itemIndexesById),
      ).toEqual(
        getIdsOfItems(result.items.slice(10, 12)),
      );
    });
  });
  describe('items for one and not full chunk', () => {
    const fromItem = 1;
    const toItem = 8;
    it('chunk count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunks.length).toBe(1);
    });
    it('chunks for render count is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(result.chunksBuildingResult.chunksForRender.length).toBe(1);
    });
    it('ids in chunk for render is correct', () => {
      const result = createDataForTest(fromItem, toItem);
      expect(
        getMapKeysAsSet(result.chunksBuildingResult.chunks[0].itemIndexesById),
      ).toEqual(
        getIdsOfItems(result.items.slice(0, 8)),
      );
    });
  });
});

import { buildChunksForIndependentPartRender } from './build-chunks-for-independent-part-render';
import { createItems } from './test-utils/create-items';
import { ChunkedListItemsModification } from '../types/chunked-list-items-modification';
import { ChunkedListItem } from '../types/chunked-list-item';
import { createChunkId } from './create-chunk-id';
import { getMapKesAsArray } from '../../../../lib/test-utils/get-map-keys-as-array';
import { ChunkedRenderListItemsChunkModel } from './chunked-render-list-items-chunk-model';

describe('buildChunksForIndependentPartRender', () => {
  describe('interaction in the middle of chunks', () => {
    function createFixtureForInteractionWithChunkInTheMiddle(
    ): ChunkedListItemsModification<ChunkedListItem> {
      const children = createItems(1, 10);
      return {
        modificationType: 'INTERACTION_WITH',
        children,
        modifyingChildren: children,
        bearingItemId: '5',
      };
    }
    it('interaction chunk is correct', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      const mainInteractionChunk = result.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(
        getMapKesAsArray((mainInteractionChunk.itemIndexesById)),
      ).toEqual(['5', '6']);
      expect(result.chunksForRender[1]).toBe(mainInteractionChunk);
      expect(result.chunks[2]).toBe(mainInteractionChunk);
    });
    it('correct chunks count', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      expect(result.chunksForRender.length).toBe(3);
      expect(result.chunks.length).toBe(5);
    });
    it('have only one chunk for render before', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      const chunksForRender = result.chunksForRender;
      expect(chunksForRender[0]).toBeDefined();
      expect(
        getMapKesAsArray(chunksForRender[0].itemIndexesById),
      ).toEqual(['3', '4']);
    });
    it('have only one chunk for render after', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      const chunksForRender = result.chunksForRender;
      expect(chunksForRender[2]).toBeDefined();
      expect(
        getMapKesAsArray(chunksForRender[2].itemIndexesById),
      ).toEqual(['7', '8']);
    });
    it('have chunks not render before', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      const chunks = result.chunks;
      const chunksForRender = result.chunksForRender;
      expect(chunks[0]).not.toBe(chunksForRender[0]);
      expect(chunks[1]).toBe(chunksForRender[0]);
      expect(
        getMapKesAsArray(chunks[0].itemIndexesById),
      ).toEqual(['1', '2']);
    });
    it('have chunks not render after', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithChunkInTheMiddle(),
      );
      const chunks = result.chunks;
      const chunksForRender = result.chunksForRender;
      expect(chunks[4]).not.toBe(chunksForRender[2]);
      expect(chunks[3]).toBe(chunksForRender[2]);
      expect(
        getMapKesAsArray(chunks[4].itemIndexesById),
      ).toEqual(['9', '10']);
    });
  });
  describe('interaction in first chunk', () => {
    function createFixtureForInteractionWithFirstChunk(
    ): ChunkedListItemsModification<ChunkedListItem> {
      const children = createItems(1, 10);
      return {
        modificationType: 'INTERACTION_WITH',
        children,
        modifyingChildren: children,
        bearingItemId: '1',
      };
    }
    it('interaction chunk is correct', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithFirstChunk(),
      );
      const mainInteractionChunk = result.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(
        getMapKesAsArray((mainInteractionChunk.itemIndexesById)),
      ).toEqual(['1', '2']);
      expect(result.chunksForRender[0]).toBe(mainInteractionChunk);
      expect(result.chunks[0]).toBe(mainInteractionChunk);
    });
    it('correct chunks count', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithFirstChunk(),
      );
      expect(result.chunks.length).toBe(5);
      expect(result.chunksForRender.length).toBe(2);
    });
  });
  describe('interaction in last chunk', () => {
    function createFixtureForInteractionWithLastChunk(
    ): ChunkedListItemsModification<ChunkedListItem> {
      const children = createItems(1, 10);
      return {
        modificationType: 'INTERACTION_WITH',
        children,
        modifyingChildren: children,
        bearingItemId: '10',
      };
    }
    it('interaction chunk is correct', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithLastChunk(),
      );
      const mainInteractionChunk = result.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(
        getMapKesAsArray((mainInteractionChunk.itemIndexesById)),
      ).toEqual(['10']);
      expect(result.chunksForRender[1]).toBe(mainInteractionChunk);
      expect(result.chunks[5]).toBe(mainInteractionChunk);
    });
    it('correct chunks count', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithLastChunk(),
      );
      expect(result.chunks.length).toBe(6);
      expect(result.chunksForRender.length).toBe(2);
    });
  });
  describe('only one chunk for render', () => {
    function createFixtureForInteractionWithLastChunk(
    ): ChunkedListItemsModification<ChunkedListItem> {
      const children = createItems(1, 2);
      return {
        modificationType: 'INTERACTION_WITH',
        children,
        modifyingChildren: children,
        bearingItemId: '1',
      };
    }
    it('interaction chunk is correct', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithLastChunk(),
      );
      const mainInteractionChunk = result.mainInteractionChunk as
        ChunkedRenderListItemsChunkModel<ChunkedListItem>;
      expect(mainInteractionChunk).toBeDefined();
      expect(
        getMapKesAsArray((mainInteractionChunk.itemIndexesById)),
      ).toEqual(['1', '2']);
      expect(result.chunksForRender[0]).toBe(mainInteractionChunk);
      expect(result.chunks[0]).toBe(mainInteractionChunk);
    });
    it('correct chunks count', () => {
      const result = buildChunksForIndependentPartRender(
        createChunkId,
        2,
        createFixtureForInteractionWithLastChunk(),
      );
      expect(result.chunks.length).toBe(1);
      expect(result.chunksForRender.length).toBe(1);
    });
  });
});

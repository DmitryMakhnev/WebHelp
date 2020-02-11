import { ChunkedRenderListItem } from '../../chunked-render-list-item';
import { ChunkedRenderListItemsChunksBuildResult } from '../chunked-render-list-items-chunks-build-result';
import { DEFAULT_CHUNK_SIZE_FOR_TESTS } from './build-chunks-test-consts';
import { createItems } from './create-items';
import { buildChunksForFullRerender } from '../build-chunks-for-full-rerender';
import { createChunkId } from '../chunk-id-factory';
import { ItemsCreationOptions } from './items-creation-options';

export interface CreatedInitialChunksDataResult {
  items: ChunkedRenderListItem[];
  initialChunks: ChunkedRenderListItemsChunksBuildResult<ChunkedRenderListItem>;
}

export function createInitialChunksData(
  itemsOrItemsCreationOptions: ItemsCreationOptions|ChunkedRenderListItem[],
  chunkSize = DEFAULT_CHUNK_SIZE_FOR_TESTS,
): CreatedInitialChunksDataResult {
  const items = Array.isArray(itemsOrItemsCreationOptions)
    ? itemsOrItemsCreationOptions
    : createItems(
      itemsOrItemsCreationOptions.from,
      itemsOrItemsCreationOptions.to,
      itemsOrItemsCreationOptions.prefix,
    );
  return {
    items,
    initialChunks: buildChunksForFullRerender(
      createChunkId,
      chunkSize,
      {
        modificationType: 'INITIAL',
        children: items,
        modifyingChildren: items,
        bearingItemId: null,
      },
    ),
  };
}

import React, { useMemo } from 'react';
import { ChunkedListChunksController, ChunkedListChunksControllerProps } from './chunked-list-chunks-controller';
import { ChunkedListItem } from './types/chunked-list-item';
import { ChunkedListItemsModification } from './types/chunked-list-items-modification';
import { generateUniqClientSideId } from '../../../lib/id/generate-uniq-client-side-id';


/**
 * @description Component for displaying big lists by chunks for good performance
 */
export function ChunkedList<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
>(props: ChunkedListChunksControllerProps<IT, MT>) {
  // we must rebuild list component fully if ChunkedListItemsModification is changed
  const listModificationHolderKey = useMemo(
    generateUniqClientSideId,
    [props.listModificationHolder],
  );

  return <ChunkedListChunksController key={listModificationHolderKey} {...props} />;
}

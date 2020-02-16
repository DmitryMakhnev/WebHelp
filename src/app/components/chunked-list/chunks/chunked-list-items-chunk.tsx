import React, { ReactElement } from 'react';
import { ChunkedListItem } from '../types/chunked-list-item';

interface ListItemsChunkProps<IT extends ChunkedListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
}

export function ChunkedListItemsChunk<IT extends ChunkedListItem>(
  props: ListItemsChunkProps<IT>,
): ReactElement {
  return <>{props.items.map(pageViewRepresentation => props.renderItem(pageViewRepresentation))}</>;
}

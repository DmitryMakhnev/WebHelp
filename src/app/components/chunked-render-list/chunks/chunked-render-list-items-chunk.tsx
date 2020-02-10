import React, { ReactElement } from 'react';
import { ChunkedRenderListItem } from '../chunked-render-list-item';

interface ListItemsChunkProps<IT extends ChunkedRenderListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
}

export function ChunkedRenderListItemsChunk<IT extends ChunkedRenderListItem>(
  props: ListItemsChunkProps<IT>,
): ReactElement {
  return <>{props.items.map(pageViewRepresentation => props.renderItem(pageViewRepresentation))}</>;
}

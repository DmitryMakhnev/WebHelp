import React, { ReactElement } from 'react';
import { ChunkedRenderListItemRepresentation } from '../chunked-render-list-item-representation';

interface ListItemsChunkProps<IT extends ChunkedRenderListItemRepresentation> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
}

export function ChunkedRenderListItemsChunk<IT extends ChunkedRenderListItemRepresentation>(
  props: ListItemsChunkProps<IT>,
): ReactElement {
  return <>{props.items.map(pageViewRepresentation => props.renderItem(pageViewRepresentation))}</>;
}

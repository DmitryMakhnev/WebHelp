import { ChunkedRenderListItem } from './chunked-render-list-item';
import { ChunkedRenderListItemsModification } from './chunked-render-list-items-modification';

export interface ChunkedRenderListModificationHolder<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
> {
  childrenModification: MT;
}

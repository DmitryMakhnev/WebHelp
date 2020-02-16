import { ChunkedListItem } from './chunked-list-item';
import { ChunkedListItemsModification } from './chunked-list-items-modification';

export interface ChunkedListModificationHolder<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
> {
  childrenModification: MT;
}

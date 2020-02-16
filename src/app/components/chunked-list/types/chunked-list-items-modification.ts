import { ChunkedListItemsModificationType } from './chunked-list-items-modification-type';
import { ChunkedListItem } from './chunked-list-item';

export interface ChunkedListItemsModification<
  T extends ChunkedListItem
> {
  modificationType: ChunkedListItemsModificationType;
  children: T[];
  modifyingChildren: T[];
  bearingItemId: string | null;
}

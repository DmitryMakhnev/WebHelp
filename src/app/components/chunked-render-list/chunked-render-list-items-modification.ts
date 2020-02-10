import { ChunkedRenderListItemsModificationType } from './chunked-render-list-items-modification-type';
import { ChunkedRenderListItem } from './chunked-render-list-item';

export interface ChunkedRenderListItemsModification<
  T extends ChunkedRenderListItem
> {
  modificationType: ChunkedRenderListItemsModificationType;
  children: T[];
  modifyingChildren: T[];
  bearingItemId: string | null;
}

import { ChunkedRenderListItemsModificationType } from './chunked-render-list-items-modification-type';
import { ChunkedRenderListItemRepresentation } from './chunked-render-list-item-representation';

export interface ChunkedRenderListItemsModificationRepresentation<
  T extends ChunkedRenderListItemRepresentation
> {
  modificationType: ChunkedRenderListItemsModificationType;
  children: T[];
  modifyingChildren: T[];
  bearingItemId: string | null;
}

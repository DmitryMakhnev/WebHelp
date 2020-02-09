import { ChunkedRenderListItemRepresentation } from './chunked-render-list-item-representation';
import { ChunkedRenderListItemsModificationRepresentation } from './chunked-render-list-items-modification-representation';

export interface ChunkedRenderListChildrenRepresentationHolder<
  IT extends ChunkedRenderListItemRepresentation,
  MT extends ChunkedRenderListItemsModificationRepresentation<IT>
> {
  childrenRepresentation: MT;
}

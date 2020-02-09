import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { ChunkedRenderListItemsModificationRepresentation } from '../../../../../components/chunked-render-list/chunked-render-list-items-modification-representation';

export interface TableOfContentsChildrenModificationRepresentation
  extends ChunkedRenderListItemsModificationRepresentation<TableOfContentsPageViewRepresentation> {}

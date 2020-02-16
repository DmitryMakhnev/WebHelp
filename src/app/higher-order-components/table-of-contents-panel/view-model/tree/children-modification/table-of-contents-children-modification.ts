import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { ChunkedListItemsModification } from '../../../../../components/chunked-list/types/chunked-list-items-modification';

export interface TableOfContentsChildrenModification
  extends ChunkedListItemsModification<TableOfContentsPageViewRepresentation> {}

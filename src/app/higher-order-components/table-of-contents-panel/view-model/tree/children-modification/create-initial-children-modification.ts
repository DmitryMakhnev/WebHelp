import { TableOfContentsChildrenModification } from './table-of-contents-children-modification';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';

export function createInitialChildrenModification(
  tableOfContents: TableOfContentsApiResponse,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
): TableOfContentsChildrenModification {
  const topLevelIds = tableOfContents.topLevelIds;
  const children = topLevelIds.map(
    pageId => pageViewRepresentationsById.get(pageId) as TableOfContentsPageViewRepresentation,
  );
  return {
    modificationType: 'INITIAL',
    children,
    modifyingChildren: children,
    bearingItemId: null,
  };
}

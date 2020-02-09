import { ChildrenRepresentation } from './children-representation';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';

export function createInitialChildrenRepresentation(
  tableOfContents: TableOfContentsApiResponse,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
): ChildrenRepresentation {
  const topLevelIds = tableOfContents.topLevelIds;
  const children = topLevelIds.map(
    pageId => pageViewRepresentationsById.get(pageId) as TableOfContentsPageViewRepresentation,
  );
  return {
    modificationType: 'INITIAL',
    children,
    subPart: children,
    bearingPageId: null,
  };
}

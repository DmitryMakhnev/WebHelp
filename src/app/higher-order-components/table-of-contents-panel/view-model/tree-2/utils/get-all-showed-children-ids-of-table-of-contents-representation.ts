import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from './create-page-view-representations-by-id-index';

export function getAllShowedChildrenIdsOfTableOfContentsRepresentation(
  currentPageViewRepresentation: TableOfContentsPageViewRepresentation,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
): Set<TableOfContentsPageId> {
  const allShowedChildrenIdsOfRepresentation = new Set<TableOfContentsPageId>();
  const childrenIds = [currentPageViewRepresentation.currentChildren];
  while (childrenIds.length) {
    const currentChildrenIdsSet = childrenIds.shift() as Set<TableOfContentsPageId>;
    currentChildrenIdsSet.forEach(childrenId => {
      const childrenRepresentation = pageViewRepresentationsById
        .get(childrenId) as TableOfContentsPageViewRepresentation;
      allShowedChildrenIdsOfRepresentation.add(childrenRepresentation.id);
      if (childrenRepresentation.hasChildren
        && childrenRepresentation.isSubPagesShowed
      ) {
        childrenIds.push(childrenRepresentation.currentChildren);
      }
    });
  }
  return allShowedChildrenIdsOfRepresentation;
}

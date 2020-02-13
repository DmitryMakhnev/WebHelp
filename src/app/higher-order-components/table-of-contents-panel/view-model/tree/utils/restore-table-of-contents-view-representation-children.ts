import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export function restoreTableOfContentsViewRepresentationChildren(
  sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[],
) {
  sortedPageViewRepresentations.forEach(representation => {
    representation.setCurrentChildren(representation.children);
    if (representation.hasChildren) {
      representation.setIsSubPagesShowed(false);
    }
  });
}

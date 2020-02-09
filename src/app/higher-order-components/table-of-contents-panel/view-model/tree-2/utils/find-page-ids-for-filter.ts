import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from './create-page-view-representations-by-id-index';

function putAllParentPageIdsIntoFilteringResult(
  pageViewRepresentation: TableOfContentsPageViewRepresentation,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
  foundPageIds: Set<TableOfContentsPageId>,
) {
  let foundPage = pageViewRepresentation.page;
  while (foundPage.parentId && !foundPageIds.has(foundPage.parentId)) {
    foundPageIds.add(foundPage.parentId);
    const parentPageViewRepresentation = pageViewRepresentationsById.get(
      foundPage.parentId,
    ) as TableOfContentsPageViewRepresentation;
    foundPage = parentPageViewRepresentation.page;
  }
}

export function findPageIdsForFilter(
  sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[],
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
  filters: {
    textQuery: string;
  },
): Set<TableOfContentsPageId> {
  const preparedQuery = filters.textQuery.toLocaleLowerCase();
  const foundPageIds = new Set<TableOfContentsPageId>();

  sortedPageViewRepresentations.forEach(pageViewRepresentation => {
    const page = pageViewRepresentation.page;
    const isMatchedPage = page.title.toLocaleLowerCase().indexOf(preparedQuery) !== -1;

    if (isMatchedPage) {
      foundPageIds.add(page.id);
      putAllParentPageIdsIntoFilteringResult(
        pageViewRepresentation,
        pageViewRepresentationsById,
        foundPageIds,
      );
    }
  });

  return foundPageIds;
}

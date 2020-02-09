import { ChildrenRepresentation } from './children-representation';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { findPageIdsForFilter } from '../utils/find-page-ids-for-filter';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';
import { filterSet } from '../../../../../../lib/sets/filter-set';

export function createFilteredChildrenRepresentation(
  sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[],
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
  textQuery: string,
): ChildrenRepresentation {
  // search
  const foundPageIds = findPageIdsForFilter(
    sortedPageViewRepresentations,
    pageViewRepresentationsById,
    {
      textQuery,
    },
  );

  // build current list
  const foundAndSortedPageViewRepresentations = sortedPageViewRepresentations.filter(
    pageViewRepresentation => foundPageIds.has(pageViewRepresentation.page.id),
  );

  // manage current children
  foundAndSortedPageViewRepresentations.forEach(pageViewRepresentation => {
    if (pageViewRepresentation.children.size !== 0) {
      const newChildren = filterSet(pageViewRepresentation.children, pageId =>
        foundPageIds.has(pageId),
      );
      pageViewRepresentation.setCurrentChildren(newChildren);
    }
  });

  // manage open states
  sortedPageViewRepresentations.forEach(pageViewRepresentation => {
    const hasChildrenForCurrentQuery = pageViewRepresentation.currentChildren.size !== 0;
    pageViewRepresentation.setIsOpen(hasChildrenForCurrentQuery);
  });

  return {
    modificationType: 'FILTERED',
    children: foundAndSortedPageViewRepresentations,
    subPart: foundAndSortedPageViewRepresentations,
    bearingPageId: null,
  };
}

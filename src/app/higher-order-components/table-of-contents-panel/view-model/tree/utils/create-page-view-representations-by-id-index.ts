import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export type TableOfContentsPageViewRepresentationById = Map<
  TableOfContentsPageId,
  TableOfContentsPageViewRepresentation
>;

export function createPageViewRepresentationsByIdIndex(
  sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[],
): TableOfContentsPageViewRepresentationById {
  const index = new Map<TableOfContentsPageId, TableOfContentsPageViewRepresentation>();
  sortedPageViewRepresentations.forEach(pageViewRepresentation => {
    index.set(pageViewRepresentation.page.id, pageViewRepresentation);
  });
  return index;
}

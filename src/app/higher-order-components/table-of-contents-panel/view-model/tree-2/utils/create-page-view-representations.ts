import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export function createPageViewRepresentations(
  sortedPages: TableOfContentsPage[],
): TableOfContentsPageViewRepresentation[] {
  return sortedPages.map((page, index) => new TableOfContentsPageViewRepresentation(page, index));
}

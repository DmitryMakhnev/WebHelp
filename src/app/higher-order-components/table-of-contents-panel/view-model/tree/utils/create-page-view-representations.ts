import { runInAction } from 'mobx';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export function createPageViewRepresentations(
  sortedPages: TableOfContentsPage[],
): TableOfContentsPageViewRepresentation[] {
  return runInAction(
    () => sortedPages.map(page => new TableOfContentsPageViewRepresentation(page)),
  );
}

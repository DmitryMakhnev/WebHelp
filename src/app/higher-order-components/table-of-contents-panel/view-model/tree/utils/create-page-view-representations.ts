import { runInAction } from 'mobx';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export function createPageViewRepresentations(
  sortedPages: TableOfContentsPage[],
  tableOfContents: TableOfContentsApiResponse,
): TableOfContentsPageViewRepresentation[] {
  return runInAction(
    () => sortedPages.map(page => {
      let anchors: TableOfContentsAnchor[]|undefined;
      if (page.anchors) {
        anchors = page.anchors.map(
          anchorId => tableOfContents.entities.anchors[anchorId],
        );
      }
      return new TableOfContentsPageViewRepresentation(page, anchors);
    }),
  );
}

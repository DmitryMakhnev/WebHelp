export function findAnchorsOfPage(
  tableOfContentsApiResponse: TableOfContentsApiResponse,
  pageId: TableOfContentsPageId,
): TableOfContentsAnchor[] {
  const entities = tableOfContentsApiResponse.entities;
  const anchorIds = entities.pages[pageId].anchors;
  if (anchorIds) {
    const anchors = entities.anchors;
    return anchorIds.map(anchorId => anchors[anchorId]);
  }
  return [];
}

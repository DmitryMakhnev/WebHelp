export function getPagesPathToPageFromRoot(
  tableOfContents: TableOfContentsApiResponse,
  pageId: TableOfContentsPageId,
): TableOfContentsPageId[] | null {
  const path = [];
  const pages = tableOfContents.entities.pages;
  let page: TableOfContentsPage | undefined = pages[pageId];
  while (page) {
    path.unshift(page.id);
    page = page.parentId ? pages[page.parentId] : undefined;
  }
  return path.length !== 0 ? path : null;
}

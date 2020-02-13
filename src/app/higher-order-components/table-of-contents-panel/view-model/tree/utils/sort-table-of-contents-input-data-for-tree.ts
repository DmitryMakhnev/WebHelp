export function sortTableOfContentsInputDataForTree(
  tableOfContents: TableOfContentsApiResponse,
): TableOfContentsPage[] {
  const sortedPages: TableOfContentsPage[] = [];

  const pages = tableOfContents.entities.pages;
  const pagesIds: TableOfContentsPageId[] = [...tableOfContents.topLevelIds];
  while (pagesIds.length) {
    const currentPageId = pagesIds.shift() as TableOfContentsPageId;
    const page = pages[currentPageId];
    sortedPages.push(page);
    if (page.pages) {
      pagesIds.unshift(...page.pages);
    }
  }

  return sortedPages;
}

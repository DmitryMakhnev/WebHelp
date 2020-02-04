interface FoundPages {
  pages: Record<TableOfContentsPageId, TableOfContentsPage>;
  pageIds: Set<TableOfContentsPageId>;
  topLevelIds: TableOfContentsPageId[];
}

/*
 * At this time it doesn't mange children pages list of page for better performance.
 * Also at this time it's just simple solution.
 * Current complexity: O(n) for pages + indexOf + O(n) for parents.
 * It looks like enough.
 */
export function findPagesByText(
  pages: Record<TableOfContentsPageId, TableOfContentsPage>,
  text: string,
): FoundPages | null {
  console.time('3');
  const transformedText = text.toLocaleLowerCase();

  // fin all matched pages ids
  const foundPageIds = new Set<TableOfContentsPageId>();
  Object.values(pages).forEach(page => {
    const isMatchedPage = page.title.toLocaleLowerCase().indexOf(transformedText) !== -1;
    if (isMatchedPage) {
      foundPageIds.add(page.id);
      // find all parent pages ids of matched page
      let foundPage = page;
      while (foundPage.parentId) {
        foundPageIds.add(foundPage.parentId);
        foundPage = pages[foundPage.parentId];
      }
    }
  });

  if (foundPageIds.size === 0) {
    return null;
  }

  // transform all matched ids to object of pages
  const foundPages: Record<TableOfContentsPageId, TableOfContentsPage> = {};
  const foundTopLevelPagesIds: TableOfContentsPageId[] = [];
  foundPageIds.forEach(pageId => {
    const page = pages[pageId];
    const newPage = { ...page };
    if (newPage.pages) {
      const newChildPages = newPage.pages.filter(childPageId => foundPageIds.has(childPageId));
      newPage.pages = newChildPages.length ? newChildPages : undefined;
    }
    foundPages[pageId] = newPage;
    if (page.level === 0) {
      foundTopLevelPagesIds.push(page.id);
    }
  });

  console.timeEnd('3');
  return {
    pages: foundPages,
    topLevelIds: foundTopLevelPagesIds,
    pageIds: foundPageIds,
  };
}

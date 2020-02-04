export function findFirstPageOfLevel(
  tableOfContents: TableOfContentsApiResponse,
  level: number,
): TableOfContentsPage {
  return Object.values(tableOfContents.entities.pages).find(
    page => page.level === level,
  ) as TableOfContentsPage;
}

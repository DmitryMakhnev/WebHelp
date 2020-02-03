
export function getUniqueValuesOfFieldOfAllPages<K extends keyof TableOfContentsPage>(
  pages: Record<TableOfContentsPageId, TableOfContentsPage>,
  key: K,
): Set<TableOfContentsPage[K]> {
  const uniqueValues = new Set<TableOfContentsPage[K]>();
  Object.values(pages).forEach(page => {
    uniqueValues.add(page[key]);
  });
  return uniqueValues;
}

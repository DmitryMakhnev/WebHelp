
interface TableOfContentsFiltrationResult {
  wasFiltered: boolean;
  hasMatched: boolean;
  textFilter: string|null;
  tableOfContent: TableOfContentsApiResponse|null;
  foundPageIds: Set<TableOfContentsPageId>|null;
}

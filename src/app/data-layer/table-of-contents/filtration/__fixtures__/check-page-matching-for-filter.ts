export function checkPageMatchingForFilter(page: TableOfContentsPage, textFilter: string): boolean {
  return page.title.toLocaleLowerCase().indexOf(textFilter.toLocaleLowerCase()) !== -1;
}

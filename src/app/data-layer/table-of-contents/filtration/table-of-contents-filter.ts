import
{
  action,
  computed,
  observable,
  runInAction,
} from 'mobx';
import { findPagesByText } from './find-pages-by-text';

/*
 * This filter doesn't work with Anchors
 */
export class TableOfContentsFilter {
  constructor(
    tableOfContents: TableOfContentsApiResponse|null,
  ) {
    this.tableOfContents = tableOfContents;
  }

  @observable.ref
  private tableOfContents: TableOfContentsApiResponse|null;

  @observable.ref
  private textFilter: string|null = null;

  @action.bound
  filterByText(text: string|null) {
    this.textFilter = text;
  }

  @computed
  get filtrationResult(): TableOfContentsFiltrationResult {
    const textFilter = this.textFilter;
    let wasFiltered = false;
    let hasMatched = false;
    let tableOfContent: TableOfContentsApiResponse|null = null;
    let foundPageIds: Set<TableOfContentsPageId>|null = null;

    if (textFilter) {
      wasFiltered = true;
      const storedTableOfContents = this.tableOfContents;
      if (storedTableOfContents) {
        const tableOfContentsEntities = storedTableOfContents.entities;
        const foundPages = findPagesByText(tableOfContentsEntities.pages, textFilter);
        if (foundPages) {
          hasMatched = true;
          tableOfContent = {
            entities: {
              pages: foundPages.pages,
              // at this time we don't work with anchors
              anchors: tableOfContentsEntities.anchors,
            },
            topLevelIds: foundPages.topLevelIds,
          };
          foundPageIds = foundPages.pageIds;
        }
      }
    }

    return {
      wasFiltered,
      hasMatched,
      textFilter,
      tableOfContent,
      foundPageIds,
    };
  }

  @action
  rest() {
    this.filterByText(null);
  }
}

export function createTableOfContentsFilter(
  tableOfContents: TableOfContentsApiResponse|null,
) {
  return runInAction(() => new TableOfContentsFilter(tableOfContents));
}

import { action, observable, runInAction } from 'mobx';

export class TableOfContentsTree2 {
  constructor(private tableOfContents: TableOfContentsApiResponse | null) {
    if (tableOfContents) {
      const pages = tableOfContents.entities.pages;
      const topLevelIds = tableOfContents.topLevelIds;
      this.children = topLevelIds.map(pageId => pages[pageId]);
    }
  }

  @observable.ref
  children: TableOfContentsPage[] = [];

  @observable.ref
  textQuery: string = '';

  @action.bound
  find(textQuery: string) {
    const textQueryToLoverCase = textQuery.toLocaleLowerCase();
    this.textQuery = textQuery;
    if (this.tableOfContents) {
      this.children = Object.values(this.tableOfContents.entities.pages).filter(
        page => page.title.toLocaleLowerCase().indexOf(textQueryToLoverCase) !== -1,
      );
    }
  }
}

export function createTableOfContentsTree2(tableOfContents: TableOfContentsApiResponse | null) {
  return runInAction(() => new TableOfContentsTree2(tableOfContents));
}

import { observable, runInAction } from 'mobx';
// eslint-disable-next-line import/no-cycle
import { createTableOfContentsTreeNode, TableOfContentsTreeNode } from './create-table-of-contents-tree-node';

export class TableOfContentsTree {
  constructor(
    private indexByApi: TableOfContentsApiResponse|null,
  ) {
    if (this.indexByApi) {
      this.children = this.createNodes(this.indexByApi.topLevelIds);
    }
  }

  @observable.ref
  children: TableOfContentsTreeNode[] = [];

  createNodes(
    pagesIds: TableOfContentsPageId[],
  ): TableOfContentsTreeNode[] {
    if (this.indexByApi) {
      const pages = this.indexByApi.entities.pages;
      return pagesIds.map(
        pageId => createTableOfContentsTreeNode(
          this,
          pages[pageId],
        ),
      );
    }
    return [];
  }
}

export function createTableOfContentsTree(
  tablesOfContent: TableOfContentsApiResponse|null,
): TableOfContentsTree {
  return runInAction(() => new TableOfContentsTree(tablesOfContent));
}

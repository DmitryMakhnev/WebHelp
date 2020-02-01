import { computed, runInAction } from 'mobx';
import { TableOfContentsModel } from '../../../data-layer/table-of-contents/table-of-contents.model';
import { createTableOfContentsTree, TableOfContentsTree } from './tree/table-of-contents-tree';

export class TableOfContentsPanelViewModel {
  constructor(
    private tableOfContentsModel: TableOfContentsModel,
  ) {}

  @computed
  get tree(): TableOfContentsTree {
    const rawTableOfContents = this.tableOfContentsModel.data;
    return createTableOfContentsTree(rawTableOfContents);
  }
}

export function createTableOfContentsPanelViewModel(
  tableOfContentsModel: TableOfContentsModel,
): TableOfContentsPanelViewModel {
  return runInAction(
    () => new TableOfContentsPanelViewModel(
      tableOfContentsModel,
    ),
  );
}

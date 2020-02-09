import { computed, runInAction } from 'mobx';
import { TableOfContentsModel } from '../../../data-layer/table-of-contents/table-of-contents.model';
import { createTableOfContentsTree, TableOfContentsTree } from './tree/table-of-contents-tree';
import {
  createTableOfContentsTree2,
  TableOfContentsTree2,
} from './tree-2/table-of-contents-tree-2';

export class TableOfContentsPanelViewModel {
  constructor(private tableOfContentsModel: TableOfContentsModel) {}

  @computed
  get tree(): TableOfContentsTree {
    const rawTableOfContents = this.tableOfContentsModel.data;
    return createTableOfContentsTree(rawTableOfContents);
  }

  @computed
  get tree2(): TableOfContentsTree2 | null {
    return this.tableOfContentsModel.data
      ? createTableOfContentsTree2(this.tableOfContentsModel.data)
      : null;
  }
}

export function createTableOfContentsPanelViewModel(
  tableOfContentsModel: TableOfContentsModel,
): TableOfContentsPanelViewModel {
  return runInAction(() => new TableOfContentsPanelViewModel(tableOfContentsModel));
}

import { computed, runInAction } from 'mobx';
import { TableOfContentsModel } from '../../../data-layer/table-of-contents/table-of-contents.model';
import {
  createTableOfContentsTree,
  TableOfContentsTree,
} from './tree/table-of-contents-tree';

export class TableOfContentsPanelViewModel {
  constructor(private tableOfContentsModel: TableOfContentsModel) {}

  @computed
  get treeDataLoadingState() {
    return this.tableOfContentsModel.fetchingDataState.asFlags;
  }

  @computed
  get tree(): TableOfContentsTree | null {
    return this.tableOfContentsModel.data
      ? createTableOfContentsTree(this.tableOfContentsModel.data)
      : null;
  }
}

export function createTableOfContentsPanelViewModel(
  tableOfContentsModel: TableOfContentsModel,
): TableOfContentsPanelViewModel {
  return runInAction(() => new TableOfContentsPanelViewModel(tableOfContentsModel));
}

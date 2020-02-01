import { action, observable, runInAction } from 'mobx';
// eslint-disable-next-line import/no-cycle
import { TableOfContentsTree } from './create-table-of-contents-tree';

export class TableOfContentsTreeNode {
  constructor(
    private tree: TableOfContentsTree,
    public page: TableOfContentsPage,
  ) {}

  @observable
  isContendShowed: boolean = false;

  get isHasContent(): boolean {
    return this.page.pages != null;
  }

  @observable.ref
  children: TableOfContentsTreeNode[] = [];

  @action
  setContentShowing(isContendShowed: boolean) {
    if (this.isHasContent) {
      this.isContendShowed = isContendShowed;
      if (isContendShowed) {
        this.children = this.tree.createNodes(
          this.page.pages as TableOfContentsPageId[],
        );
      } else {
        this.children = [];
      }
    }
  }

  @action.bound
  toggle() {
    this.setContentShowing(!this.isContendShowed);
  }
}

export function createTableOfContentsTreeNode(
  tree: TableOfContentsTree,
  page: TableOfContentsPage,
) {
  return runInAction(() => new TableOfContentsTreeNode(tree, page));
}

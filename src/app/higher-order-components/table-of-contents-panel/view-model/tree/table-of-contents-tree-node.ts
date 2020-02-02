import
{
  action,
  computed,
  observable,
  runInAction,
} from 'mobx';
// eslint-disable-next-line import/no-cycle
import { TableOfContentsTree } from './table-of-contents-tree';

export class TableOfContentsTreeNode {
  constructor(
    private tree: TableOfContentsTree,
    public page: TableOfContentsPage,
  ) {}

  get isHasContent(): boolean {
    return this.page.pages != null;
  }

  @observable
  isContendBuilt: boolean = false;

  @action
  setIsContendBuilt(isContendBuilt: boolean) {
    this.isContendBuilt = isContendBuilt;
  }

  @observable.ref
  children: TableOfContentsTreeNode[] = [];

  @action
  setChildren(children: TableOfContentsTreeNode[]) {
    this.children = children;
  }

  @computed
  get isSelected(): boolean {
    return this.page.id === this.tree.selectedPageId;
  }

  @computed
  get isParentOfSelected(): boolean {
    return this.tree.pageIdsOfParentsOfSelectedPage.has(this.page.id);
  }

  @action.bound
  toggle() {
    this.tree.manageNodeContent(this, !this.isContendBuilt);
  }

  @action.bound
  select() {
    this.tree.selectByPageId(this.page.id);
  }
}

export function createTableOfContentsTreeNode(
  tree: TableOfContentsTree,
  page: TableOfContentsPage,
) {
  return runInAction(() => new TableOfContentsTreeNode(tree, page));
}

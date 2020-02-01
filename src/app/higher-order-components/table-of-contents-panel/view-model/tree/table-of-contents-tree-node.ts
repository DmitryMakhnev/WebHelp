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
  get isSelected() {
    return this.tree.selectedNode === this;
  }

  @action.bound
  toggle() {
    this.tree.manageNodeContent(this, !this.isContendBuilt);
  }

  @action.bound
  select() {
    this.tree.selectNode(this);
  }
}

export function createTableOfContentsTreeNode(
  tree: TableOfContentsTree,
  page: TableOfContentsPage,
) {
  return runInAction(() => new TableOfContentsTreeNode(tree, page));
}

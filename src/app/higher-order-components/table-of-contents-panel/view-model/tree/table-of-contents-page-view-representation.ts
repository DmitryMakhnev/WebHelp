import { action, observable } from 'mobx';
import { ChunkedRenderListItem } from '../../../../components/chunked-render-list/chunked-render-list-item';

export class TableOfContentsPageViewRepresentation implements ChunkedRenderListItem {
  constructor(
    public page: TableOfContentsPage,
    public anchors: TableOfContentsAnchor[]|undefined,
  ) {
    const children = new Set<TableOfContentsPageId>();

    this.id = page.id;
    this.children = children;
    this.currentChildren = children;

    if (page.pages) {
      page.pages.forEach(pageId => {
        children.add(pageId);
      });
    }
  }

  id: TableOfContentsPageId;

  children: Set<TableOfContentsPageId>;

  currentChildren: Set<TableOfContentsPageId>;

  get hasChildren(): boolean {
    return this.currentChildren.size !== 0;
  }

  setCurrentChildren(currentChildren: Set<TableOfContentsPageId>) {
    this.currentChildren = currentChildren;
  }

  isSubPagesShowed: boolean = false;

  setIsSubPagesShowed(isSubPagesShowed: boolean) {
    this.isSubPagesShowed = isSubPagesShowed;
  }

  @observable.ref
  isSelected = false;

  @action
  setIsSelected(isSelected: boolean) {
    this.isSelected = isSelected;
  }
}


export class TableOfContentsPageViewRepresentation {
  constructor(
    public page: TableOfContentsPage,
    public sortedIndex: number,
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

  isSelected = false;

  isParentOfSelected = false;
}

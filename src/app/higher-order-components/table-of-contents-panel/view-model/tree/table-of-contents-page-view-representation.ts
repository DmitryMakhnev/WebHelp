import { action, observable } from 'mobx';
import { ChunkedListItem } from '../../../../components/chunked-list/types/chunked-list-item';

export class TableOfContentsPageViewRepresentation implements ChunkedListItem {
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

  @observable.ref
  isSubPagesShowed: boolean = false;

  @action
  setIsSubPagesShowed(isSubPagesShowed: boolean) {
    this.isSubPagesShowed = isSubPagesShowed;
  }

  @observable.ref
  isSelected = false;

  @action
  setIsSelected(isSelected: boolean) {
    this.isSelected = isSelected;
  }

  private storedShouldHaveContentAnimations: boolean = false;

  setShouldHaveContentAnimations(shouldHaveAnimation: boolean) {
    this.storedShouldHaveContentAnimations = shouldHaveAnimation;
  }

  get shouldHaveContentAnimations() {
    if (this.storedShouldHaveContentAnimations) {
      // we automate reset this flag for once animation
      this.storedShouldHaveContentAnimations = false;
      return true;
    }
    return false;
  }

  private storedShouldHaveSelectionAnimations: boolean = false;

  setShouldHaveSelectionAnimations(shouldHaveAnimation: boolean) {
    this.storedShouldHaveSelectionAnimations = shouldHaveAnimation;
  }

  get shouldHaveSelectionAnimations() {
    if (this.storedShouldHaveSelectionAnimations) {
      // we automate reset this flag for once animation
      this.storedShouldHaveSelectionAnimations = false;
      return true;
    }
    return false;
  }
}

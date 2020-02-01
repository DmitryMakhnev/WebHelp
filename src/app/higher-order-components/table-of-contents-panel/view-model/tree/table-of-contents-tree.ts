import { action, observable, runInAction } from 'mobx';
// eslint-disable-next-line import/no-cycle
import { createTableOfContentsTreeNode, TableOfContentsTreeNode } from './table-of-contents-tree-node';
import { createTableOfContentsTreeAnchors, TableOfContentsTreeAnchors } from './table-of-contents-tree-anchors';

function findAnchorsOfPage(
  tableOfContentsApiResponse: TableOfContentsApiResponse,
  pageId: TableOfContentsPageId,
): TableOfContentsAnchor[] {
  const entities = tableOfContentsApiResponse.entities;
  const anchorIds = entities.pages[pageId].anchors;
  if (anchorIds) {
    const anchors = entities.anchors;
    return anchorIds.map(anchorId => anchors[anchorId]);
  }
  return [];
}

export class TableOfContentsTree {
  constructor(
    private indexByApi: TableOfContentsApiResponse|null,
  ) {
    if (this.indexByApi) {
      this.children = this.createNodes(this.indexByApi.topLevelIds);
      this.selectNode(this.children[0]);
    }
  }

  @observable.ref
  children: TableOfContentsTreeNode[] = [];

  @observable.ref
  selectedNode: TableOfContentsTreeNode|null = null;

  @observable.ref
  currentAnchors: TableOfContentsTreeAnchors = createTableOfContentsTreeAnchors([]);

  @action
  useAnchorsOfPage(pageId: TableOfContentsPageId): TableOfContentsTreeAnchors {
    const anchors = this.indexByApi ? findAnchorsOfPage(this.indexByApi, pageId) : [];
    this.currentAnchors = createTableOfContentsTreeAnchors(anchors);
    return this.currentAnchors;
  }

  @action
  manageNodeContent(node: TableOfContentsTreeNode, isContendBuilt: boolean) {
    if (node.isHasContent) {
      node.setIsContendBuilt(isContendBuilt);
      let children: TableOfContentsTreeNode[];
      if (isContendBuilt) {
        children = this.createNodes(
          node.page.pages as TableOfContentsPageId[],
        );
      } else {
        children = [];
      }
      node.setChildren(children);
    }
  }

  @action
  selectNode(node: TableOfContentsTreeNode) {
    this.selectedNode = node;
    this.useAnchorsOfPage(node.page.id);
  }

  private createNodes(
    pagesIds: TableOfContentsPageId[],
  ): TableOfContentsTreeNode[] {
    const pages = (this.indexByApi as TableOfContentsApiResponse).entities.pages;
    return pagesIds.map(
      pageId => createTableOfContentsTreeNode(
        this,
        pages[pageId],
      ),
    );
  }
}

export function createTableOfContentsTree(
  tablesOfContent: TableOfContentsApiResponse|null,
): TableOfContentsTree {
  return runInAction(() => new TableOfContentsTree(tablesOfContent));
}

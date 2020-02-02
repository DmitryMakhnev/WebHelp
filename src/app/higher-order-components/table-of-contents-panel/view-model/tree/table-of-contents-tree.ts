import
{
  action,
  computed,
  observable,
  runInAction,
} from 'mobx';
// eslint-disable-next-line import/no-cycle
import { createTableOfContentsTreeNode, TableOfContentsTreeNode } from './table-of-contents-tree-node';
import { createTableOfContentsTreeAnchors, TableOfContentsTreeAnchors } from './table-of-contents-tree-anchors';
import { getPagesPathToPageFromRoot } from '../../../../data-layer/table-of-contents/get-pages-path-to-page-from-root';

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
      this.registerNodesInIndex(this.children);
      this.setSelectedPageId(this.children[0].page.id);
    }
  }

  @observable.ref
  children: TableOfContentsTreeNode[] = [];

  @observable.ref
  selectedPageId: TableOfContentsPageId|null = null;

  @action
  private setSelectedPageId(pageId: TableOfContentsPageId|null): boolean {
    const isPageExist = pageId != null
      && this.indexByApi != null
      && this.indexByApi.entities.pages[pageId] != null;
    this.selectedPageId = isPageExist ? pageId : null;
    return isPageExist;
  }

  @computed
  get pageIdsOfParentsOfSelectedPage(): Set<TableOfContentsPageId> {
    const selectedPageId = this.selectedPageId;
    const pageIdsOfParents = new Set<TableOfContentsPageId>();
    if (selectedPageId) {
      const pathToSelectedPage = getPagesPathToPageFromRoot(
        this.indexByApi as TableOfContentsApiResponse,
        selectedPageId,
      ) as TableOfContentsPageId[];
      if (pathToSelectedPage.length > 1) {
        const indexOfLastParent = pathToSelectedPage.length - 2;
        for (let i = 0; i <= indexOfLastParent; i += 1) {
          pageIdsOfParents.add(pathToSelectedPage[i]);
        }
      }
    }
    return pageIdsOfParents;
  }

  @computed
  get currentAnchors(): TableOfContentsTreeAnchors {
    const pageId = this.selectedPageId;
    const anchors = this.indexByApi && pageId ? findAnchorsOfPage(this.indexByApi, pageId) : [];
    return createTableOfContentsTreeAnchors(anchors);
  }

  private buildNodesByIdIndex: Map<TableOfContentsPageId, TableOfContentsTreeNode> = new Map();

  @action
  manageNodeContent(node: TableOfContentsTreeNode, isContendBuilt: boolean) {
    if (node.isHasContent && node.isContendBuilt !== isContendBuilt) {
      node.setIsContendBuilt(isContendBuilt);
      let children: TableOfContentsTreeNode[];
      if (isContendBuilt) {
        children = this.createNodes(
          node.page.pages as TableOfContentsPageId[],
        );
        this.registerNodesInIndex(children);
      } else {
        this.unregisterNodesInIndex(node.children);
        children = [];
      }
      node.setChildren(children);
    }
  }

  @action
  selectByPageId(
    pageId: TableOfContentsPageId,
    buildNodeContent: boolean = false,
  ): boolean {
    const node = this.buildNodesByIdIndex.get(pageId);

    if (!node && this.indexByApi) {
      const pathToNode = getPagesPathToPageFromRoot(
        this.indexByApi,
        pageId,
      );
      if (pathToNode) {
        this.buildNodesByPath(pathToNode);
      }
    }

    const isPageWasSelected = this.setSelectedPageId(pageId);

    if (isPageWasSelected && buildNodeContent) {
      const resultSelectedNode = this.buildNodesByIdIndex.get(pageId) as TableOfContentsTreeNode;
      this.manageNodeContent(
        resultSelectedNode,
        true,
      );
    }

    return isPageWasSelected;
  }

  private buildNodesByPath(
    pathToNode: TableOfContentsPageId[],
  ) {
    // we don't build last node sub nodes
    const iMax = pathToNode.length - 1;
    for (let i = 0; i !== iMax; i += 1) {
      const pageIdFromPath = pathToNode[i] as TableOfContentsPageId;
      const node = this.buildNodesByIdIndex.get(pageIdFromPath) as TableOfContentsTreeNode;
      this.manageNodeContent(node, true);
    }
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

  private registerNodesInIndex(nodes: TableOfContentsTreeNode[]) {
    nodes.forEach(node => {
      this.buildNodesByIdIndex.set(node.page.id, node);
    });
  }

  private unregisterNodesInIndex(nodes: TableOfContentsTreeNode[]) {
    const nodesIndex = this.buildNodesByIdIndex;
    let allNodesForUnregistering: TableOfContentsTreeNode[] = [...nodes];
    while (allNodesForUnregistering.length) {
      const currentNode = allNodesForUnregistering.shift() as TableOfContentsTreeNode;
      nodesIndex.delete(currentNode.page.id);
      if (currentNode.isContendBuilt) {
        allNodesForUnregistering = allNodesForUnregistering.concat(currentNode.children);
      }
    }
  }
}

export function createTableOfContentsTree(
  tablesOfContent: TableOfContentsApiResponse|null,
): TableOfContentsTree {
  return runInAction(() => new TableOfContentsTree(tablesOfContent));
}

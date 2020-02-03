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
import { findAnchorsOfPage } from '../../../../data-layer/table-of-contents/find-anchors-of-page';
import {
  createTableOfContentsFilter,
  TableOfContentsFilter,
} from '../../../../data-layer/table-of-contents/filtration/table-of-contents-filter';

export class TableOfContentsTree {
  constructor(
    private readonly tableOfContents: TableOfContentsApiResponse|null,
  ) {
    this.filter = createTableOfContentsFilter(this.tableOfContents);
    if (this.tableOfContents) {
      this.defaultModeChildren = this.createNodes(this.tableOfContents.topLevelIds);
      this.registerNodesInIndex(this.defaultModeChildren);
      this.setSelectedPageId(this.defaultModeChildren[0].page.id);
    }
  }

  private readonly filter: TableOfContentsFilter;

  @computed
  get isFiltrationMode() {
    return this.filter.filtrationResult.wasFiltered;
  }

  @computed
  get hasResultsByFiltration() {
    return this.filter.filtrationResult.hasMatched;
  }

  @computed
  get textOfFiltration() {
    return this.filter.filtrationResult.textFilter;
  }

  @computed
  get currentTableOfContents() {
    return this.isFiltrationMode
      ? this.filter.filtrationResult.tableOfContent
      : this.tableOfContents;
  }

  // eslint-disable-next-line max-len
  private readonly defaultIndexOfBuildNodes = new Map<TableOfContentsPageId, TableOfContentsTreeNode>();

  // eslint-disable-next-line max-len
  private filtrationModeIndexOfBuildNodes = new Map<TableOfContentsPageId, TableOfContentsTreeNode>();

  private get indexOfBuildNodes() {
    return this.isFiltrationMode
      ? this.filtrationModeIndexOfBuildNodes
      : this.defaultIndexOfBuildNodes;
  }

  private readonly defaultModeChildren: TableOfContentsTreeNode[] = [];

  @computed
  private get filtrationModeChildren(): TableOfContentsTreeNode[] {
    if (!this.isFiltrationMode || !this.hasResultsByFiltration) {
      return [];
    }
    const currentTableOfContents = (this.currentTableOfContents as TableOfContentsApiResponse);
    const nodes = this.createNodes(currentTableOfContents.topLevelIds);
    this.registerNodesInIndex(nodes);
    this.buildAllNodeOfNodes(nodes);
    return nodes;
  }

  @computed
  get children(): TableOfContentsTreeNode[] {
    return this.isFiltrationMode ? this.filtrationModeChildren : this.defaultModeChildren;
  }

  @observable.ref
  selectedPageId: TableOfContentsPageId|null = null;

  @action
  private setSelectedPageId(pageId: TableOfContentsPageId|null): boolean {
    const isPageExist = pageId != null
      && this.currentTableOfContents != null
      && this.currentTableOfContents.entities.pages[pageId] != null;
    this.selectedPageId = isPageExist ? pageId : null;
    return isPageExist;
  }

  @computed
  get pageIdsOfParentsOfSelectedPage(): Set<TableOfContentsPageId> {
    const selectedPageId = this.selectedPageId;
    const pageIdsOfParents = new Set<TableOfContentsPageId>();
    if (selectedPageId) {
      const pathToSelectedPage = getPagesPathToPageFromRoot(
        this.tableOfContents as TableOfContentsApiResponse,
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
    const anchors = this.tableOfContents && pageId
      ? findAnchorsOfPage(this.tableOfContents, pageId)
      : [];
    return createTableOfContentsTreeAnchors(anchors);
  }

  @action
  manageNodeContent(node: TableOfContentsTreeNode, isContendBuilt: boolean) {
    if (node.isHasChildPages && node.isContendBuilt !== isContendBuilt) {
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
    const isPageWasSelected = this.setSelectedPageId(pageId);

    if (isPageWasSelected) {
      const node = this.indexOfBuildNodes.get(pageId);

      // build nodes if we need
      if (!node && this.tableOfContents) {
        const pathToNode = getPagesPathToPageFromRoot(
          this.tableOfContents,
          pageId,
        );
        if (pathToNode) {
          this.buildNodesByPath(pathToNode);
        }
      }

      if (buildNodeContent) {
        const resultSelectedNode = this.indexOfBuildNodes.get(pageId) as TableOfContentsTreeNode;
        this.manageNodeContent(
          resultSelectedNode,
          true,
        );
      }
    }

    return isPageWasSelected;
  }

  @action.bound
  filterByText(text: string) {
    this.filter.filterByText(text);
  }

  @action.bound
  resetFiltration() {
    this.filter.rest();
  }

  private buildNodesByPath(
    pathToNode: TableOfContentsPageId[],
  ) {
    // we don't build last node sub nodes
    const iMax = pathToNode.length - 1;
    for (let i = 0; i !== iMax; i += 1) {
      const pageIdFromPath = pathToNode[i] as TableOfContentsPageId;
      const node = this.indexOfBuildNodes.get(pageIdFromPath) as TableOfContentsTreeNode;
      this.manageNodeContent(node, true);
    }
  }

  private buildAllNodeOfNodes(
    nodes: TableOfContentsTreeNode[],
  ) {
    let nodesForContentCreation = [...nodes];
    while (nodesForContentCreation.length) {
      const node = nodesForContentCreation.shift() as TableOfContentsTreeNode;
      if (node.isHasChildPages) {
        this.manageNodeContent(node, true);
        nodesForContentCreation = nodesForContentCreation.concat(node.children);
      }
    }
  }

  private createNodes(
    pagesIds: TableOfContentsPageId[],
  ): TableOfContentsTreeNode[] {
    const pages = (this.currentTableOfContents as TableOfContentsApiResponse).entities.pages;
    return pagesIds
      .map(
        pageId => pages[pageId],
      )
      /*
       * during filtration some child pages can be outside of filtration result
       * is not clear solution fir this method but it's effect of optimization for filtration
       * because managing of filtering child pages isn't cheap
       */
      .filter(page => page != null)
      .map(
        page => createTableOfContentsTreeNode(
          this,
          page,
        ),
      );
  }

  private registerNodesInIndex(nodes: TableOfContentsTreeNode[]) {
    nodes.forEach(node => {
      this.indexOfBuildNodes.set(node.page.id, node);
    });
  }

  private unregisterNodesInIndex(nodes: TableOfContentsTreeNode[]) {
    const nodesIndex = this.indexOfBuildNodes;
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

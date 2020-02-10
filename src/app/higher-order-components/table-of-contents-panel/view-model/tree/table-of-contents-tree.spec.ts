import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from './table-of-contents-tree';
import { TableOfContentsTreeNode } from './table-of-contents-tree-node';
import { IncorrectFixtureError } from '../../../../../lib/errors/incorrect-fixture-error';
import { getPagesPathToPageFromRoot } from '../../../../data-layer/table-of-contents/get-pages-path-to-page-from-root';
import { findNodesByPath } from './test-utils/find-nodes-by-path';
import { getUniqueValuesOfFieldOfAllPages } from '../../../../data-layer/table-of-contents/test-utils/get-unique-values-of-field-of-all-pages';
import { createTableOfContentsFilter } from '../../../../data-layer/table-of-contents/filtration/table-of-contents-filter';
import { findAllCurrentChildrenOfTree } from './test-utils/find-all-current-children-of-tree';

const response: TableOfContentsApiResponse = (HelpTOCJson as unknown) as TableOfContentsApiResponse;

describe('TablesOfContentTree', () => {
  describe('was create without errors', () => {
    it('with correct structure', done => {
      createTableOfContentsTree(response);
      done();
    });

    it('with null', done => {
      createTableOfContentsTree(null);
      done();
    });
  });

  describe('root nodes', () => {
    it('count of nodes same as in response', () => {
      const tree = createTableOfContentsTree(response);
      expect(tree.children.length).toBe(response.topLevelIds.length);
    });

    it('root node pages has correct ids', () => {
      const tree = createTableOfContentsTree(response);
      const nodePagesIds = tree.children.map(node => node.page.id);
      expect(nodePagesIds).toEqual(response.topLevelIds);
    });

    it('root nodes is empty for nullable data', () => {
      const tree = createTableOfContentsTree(null);
      expect(tree.children.length).toBe(0);
    });
  });

  describe('nodes', () => {
    describe('manageNodeContent', () => {
      it('build content for node', () => {
        const tree = createTableOfContentsTree(response);
        const responsePages = response.entities.pages;
        const nodeWithContent = tree.children.find(node => node.isHasChildPages);
        if (!nodeWithContent) {
          throw new IncorrectFixtureError("first level page with content wasn't found");
        }
        const pageOfNodeWithContent = responsePages[nodeWithContent.page.id];
        if (!pageOfNodeWithContent) {
          throw new IncorrectFixtureError('fixture format is broken');
        }
        tree.manageNodeContent(nodeWithContent, true);
        const nodeWithContentChildrenPageIds = nodeWithContent.children.map(node => node.page.id);
        expect(nodeWithContentChildrenPageIds).toEqual(pageOfNodeWithContent.pages);
      });

      it('remove content for node', () => {
        const tree = createTableOfContentsTree(response);
        const nodeWithContent = tree.children.find(node => node.isHasChildPages);
        if (!nodeWithContent) {
          throw new IncorrectFixtureError("first level page with content wasn't found");
        }
        tree.manageNodeContent(nodeWithContent, true);
        tree.manageNodeContent(nodeWithContent, false);
        expect(nodeWithContent.children.length).toBe(0);
      });
    });
  });
  describe('select page', () => {
    it('tree which was created without data has not selected node', () => {
      const tree = createTableOfContentsTree(null);
      expect(tree.selectedPageId).toBe(null);
    });

    it('select not found page', () => {
      const uniqueIdsOfFixture = getUniqueValuesOfFieldOfAllPages(response.entities.pages, 'id');
      const notExistPageId = `${uniqueIdsOfFixture.values().next()}!`;
      const tree = createTableOfContentsTree(response);
      const isPageWasSelected = tree.selectByPageId(notExistPageId);
      expect(isPageWasSelected).toBeFalsy();
      expect(tree.selectedPageId).toBe(null);
    });

    it('first node had to be selected after init', () => {
      const tree = createTableOfContentsTree(response);
      const firstPageId = response.entities.pages[response.topLevelIds[0]].id;
      expect(tree.selectedPageId).toBe(firstPageId);
      const selectedNodeOfFirstLevel = tree.children.find(
        node => node.page.id === firstPageId,
      ) as TableOfContentsTreeNode;
      expect(selectedNodeOfFirstLevel.isSelected).toBeTruthy();
    });

    it('selected node is not parent of selected', () => {
      const tree = createTableOfContentsTree(response);
      const firstPageId = response.entities.pages[response.topLevelIds[0]].id;
      expect(tree.selectedPageId).toBe(firstPageId);
      const selectedNodeOfFirstLevel = tree.children.find(
        node => node.page.id === firstPageId,
      ) as TableOfContentsTreeNode;
      expect(selectedNodeOfFirstLevel.isParentOfSelected).toBeFalsy();
    });

    it('select page for into not built subtree', () => {
      const tree = createTableOfContentsTree(response);
      const thirdLevelPage = Object.values(response.entities.pages).find(page => page.level === 2);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError("Don't have any page on third level");
      }
      const thirdLevelPageId = thirdLevelPage.id;
      const isPageWasSelected = tree.selectByPageId(thirdLevelPageId);
      const pathToSelectedNode = getPagesPathToPageFromRoot(
        response,
        thirdLevelPageId,
      ) as TableOfContentsPageId[];
      // console.log(pathToSelectedNode);
      const nodesByPath = findNodesByPath(tree, pathToSelectedNode);
      expect(isPageWasSelected).toBeTruthy();
      expect(tree.selectedPageId).toBe(thirdLevelPageId);
      expect(nodesByPath[0].isParentOfSelected).toBeTruthy();
      expect(nodesByPath[1].isParentOfSelected).toBeTruthy();
      expect(nodesByPath[2].isSelected).toBeTruthy();
    });

    it('parent of selected saves after selected node was destroyed', () => {
      const tree = createTableOfContentsTree(response);
      const thirdLevelPage = Object.values(response.entities.pages).find(page => page.level === 2);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError("Don't have any page on third level");
      }
      const thirdLevelPageId = thirdLevelPage.id;
      tree.selectByPageId(thirdLevelPageId);
      const pathToSelectedNode = getPagesPathToPageFromRoot(
        response,
        thirdLevelPageId,
      ) as TableOfContentsPageId[];
      const nodesByPath = findNodesByPath(tree, pathToSelectedNode);
      const secondLevelNode = nodesByPath[1];
      // destroy level with selected node
      tree.manageNodeContent(secondLevelNode, false);
      expect(nodesByPath[0].isParentOfSelected).toBeTruthy();
      expect(secondLevelNode.isParentOfSelected).toBeTruthy();
    });

    it('reselect after subtree destruction', () => {
      const tree = createTableOfContentsTree(response);
      const thirdLevelPage = Object.values(response.entities.pages).find(page => page.level === 2);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError("Don't have any page on third level");
      }
      const thirdLevelPageId = thirdLevelPage.id;
      tree.selectByPageId(thirdLevelPageId);
      const pathToSelectedNode = getPagesPathToPageFromRoot(
        response,
        thirdLevelPageId,
      ) as TableOfContentsPageId[];
      const nodesByPath = findNodesByPath(tree, pathToSelectedNode);
      const firstLevelNode = nodesByPath[0];
      // destroy all levels except first
      tree.manageNodeContent(nodesByPath[0], false);
      tree.selectByPageId(thirdLevelPageId);
      const nodesByPathAfterReselect = findNodesByPath(tree, pathToSelectedNode);
      expect(firstLevelNode.isParentOfSelected).toBeTruthy();
      expect(nodesByPathAfterReselect[1].isParentOfSelected).toBeTruthy();
      expect(nodesByPathAfterReselect[2].isSelected).toBeTruthy();
    });

    it('build selected node content', () => {
      const tree = createTableOfContentsTree(response);
      const pagesFromData = response.entities.pages;
      const thirdLevelPage = Object.values(pagesFromData).find(
        page => page.level === 2 && page.pages,
      );
      if (!thirdLevelPage || !thirdLevelPage.parentId) {
        throw new IncorrectFixtureError("Don't have any page on third level with children page");
      }
      const secondLevelPage = pagesFromData[thirdLevelPage.parentId];
      const secondLevelPageId = secondLevelPage.id;
      tree.selectByPageId(secondLevelPageId, true);
      const pathToSelectedNode = getPagesPathToPageFromRoot(
        response,
        secondLevelPageId,
      ) as TableOfContentsPageId[];
      const nodesByPath = findNodesByPath(tree, pathToSelectedNode);
      expect(nodesByPath[1].children.length).toBe(
        (secondLevelPage.pages as TableOfContentsPageId[]).length,
      );
    });
  });

  describe('anchors', () => {
    it('use anchors of first page after creation', () => {
      const tree = createTableOfContentsTree(response);
      const currentAnchorIds = tree.currentAnchors.list.map(anchor => anchor.id);
      expect(currentAnchorIds).toEqual(response.entities.pages[response.topLevelIds[0]].anchors);
    });

    it('current anchors were updated during select node', () => {
      const tree = createTableOfContentsTree(response);
      const currentSelectedPageId = tree.selectedPageId;
      if (!currentSelectedPageId) {
        throw new IncorrectFixtureError("Don't have any page");
      }
      const notSelectedFirstLevelPageIdWithAnchors = response.topLevelIds
        .map(pageId => response.entities.pages[pageId])
        .find(
          firstLevelPage =>
            currentSelectedPageId !== firstLevelPage.id &&
            firstLevelPage.anchors &&
            firstLevelPage.anchors.length !== 0,
        );
      if (!notSelectedFirstLevelPageIdWithAnchors) {
        throw new IncorrectFixtureError("Don't not first top level page with anchors");
      }
      const newNodeForSelection = tree.children.find(
        node => node.page.id === notSelectedFirstLevelPageIdWithAnchors.id,
      ) as TableOfContentsTreeNode;
      tree.selectByPageId(newNodeForSelection.page.id);
      const currentAnchorsIds = tree.currentAnchors.list.map(currentAnchor => currentAnchor.id);
      expect(currentAnchorsIds).toEqual(notSelectedFirstLevelPageIdWithAnchors.anchors);
    });
  });

  describe('filtration', () => {
    it('has not filtered filtration after init', () => {
      const tree = createTableOfContentsTree(response);
      expect(tree.isFiltrationMode).toBeFalsy();
      expect(tree.hasResultsByFiltration).toBeFalsy();
      expect(tree.textOfFiltration).toBe(null);
    });

    it('has correct filtration state after unmatched filtration', () => {
      const tree = createTableOfContentsTree(response);
      const pagesFromData = response.entities.pages;
      const uniquePagesTitles = getUniqueValuesOfFieldOfAllPages(pagesFromData, 'title');
      const notMatchableTitle = `${uniquePagesTitles.values().next()}!`;
      tree.filterByText(notMatchableTitle);
      expect(tree.isFiltrationMode).toBeTruthy();
      expect(tree.hasResultsByFiltration).toBeFalsy();
      expect(tree.textOfFiltration).toBe(notMatchableTitle);
    });

    it('has correct filtration state after matched filtration', () => {
      const pagesFromData = response.entities.pages;
      const thirdLevelPage = Object.values(pagesFromData).find(
        page => page.level === 2 && page.pages,
      );
      if (!thirdLevelPage || !thirdLevelPage.parentId) {
        throw new IncorrectFixtureError("Don't have any page on third level with children page");
      }
      const tree = createTableOfContentsTree(response);
      const textForFiltration = thirdLevelPage;
      tree.filterByText(textForFiltration.title);
      expect(tree.isFiltrationMode).toBeTruthy();
      expect(tree.hasResultsByFiltration).toBeTruthy();
      expect(tree.textOfFiltration).toBe(textForFiltration.title);
    });

    it('has all built nodes after matched filtration', () => {
      const pagesFromData = response.entities.pages;
      const thirdLevelPage = Object.values(pagesFromData).find(
        page => page.level === 2 && page.pages,
      );
      if (!thirdLevelPage || !thirdLevelPage.parentId) {
        throw new IncorrectFixtureError("Don't have any page on third level with children page");
      }
      const textForFiltration = thirdLevelPage.title;
      const filter = createTableOfContentsFilter(response);
      filter.filterByText(textForFiltration);
      const pureFiltrationResult = filter.filtrationResult;
      const foundPagesIds = pureFiltrationResult.foundPageIds;
      const tree = createTableOfContentsTree(response);
      tree.filterByText(textForFiltration);
      const buildNodePageIds = new Set(
        findAllCurrentChildrenOfTree(tree).map(node => node.page.id),
      );
      expect(buildNodePageIds).toEqual(foundPagesIds);
    });

    it('return nodes which was before filtration after resetting of filtration', () => {
      const tree = createTableOfContentsTree(response);
      const nodesBeforeFiltration = tree.children;
      tree.filterByText('some text');
      tree.resetFiltration();
      expect(tree.children).toBe(nodesBeforeFiltration);
    });
  });
});

import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree, TableOfContentsTree } from './table-of-contents-tree';
import { TableOfContentsTreeNode } from './table-of-contents-tree-node';
import { IncorrectFixtureError } from '../../../../../lib/errors/incorrect-fixture-error';
import { getPagesPathToPageFromRoot } from '../../../../data-layer/table-of-contents/get-pages-path-to-page-from-root';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

function findNodesByPath(
  tree: TableOfContentsTree,
  path: TableOfContentsPageId[],
): TableOfContentsTreeNode[] {
  const nodesByPath: TableOfContentsTreeNode[] = [];
  let currentChildrenHolder: TableOfContentsTree|TableOfContentsTreeNode|undefined = tree;
  for (let i = 0; i !== path.length; i += 1) {
    currentChildrenHolder = currentChildrenHolder.children.find(node => node.page.id === path[i]);
    if (!currentChildrenHolder) {
      break;
    }
    nodesByPath.push(currentChildrenHolder);
  }
  return nodesByPath;
}

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
        const nodeWithContent = tree.children.find(
          node => node.isHasContent,
        );
        if (!nodeWithContent) {
          throw new IncorrectFixtureError('first level page with content wasn\'t found');
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
        const nodeWithContent = tree.children.find(
          node => node.isHasContent,
        );
        if (!nodeWithContent) {
          throw new IncorrectFixtureError('first level page with content wasn\'t found');
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
      const tree = createTableOfContentsTree(response);
      const isPageWasSelected = tree.selectByPageId('__NOT_FOUND_ID__');
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
      const thirdLevelPage = Object.values(response.entities.pages)
        .find(page => page.level === 2 && page.pages);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError('Don\'t have any page on third level');
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
      const thirdLevelPage = Object.values(response.entities.pages)
        .find(page => page.level === 2 && page.pages);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError('Don\'t have any page on third level');
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
      const thirdLevelPage = Object.values(response.entities.pages)
        .find(page => page.level === 2 && page.pages);
      if (!thirdLevelPage) {
        throw new IncorrectFixtureError('Don\'t have any page on third level');
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
        throw new IncorrectFixtureError('Don\'t have any page');
      }
      const notSelectedFirstLevelPageIdWithAnchors = response.topLevelIds
        .map(pageId => response.entities.pages[pageId])
        .find(
          firstLevelPage => currentSelectedPageId !== firstLevelPage.id
            && firstLevelPage.anchors && firstLevelPage.anchors.length !== 0,
        );
      if (!notSelectedFirstLevelPageIdWithAnchors) {
        throw new IncorrectFixtureError('Don\'t not first top level page with anchors');
      }
      const newNodeForSelection = tree.children.find(
        node => node.page.id === notSelectedFirstLevelPageIdWithAnchors.id,
      ) as TableOfContentsTreeNode;
      tree.selectByPageId(newNodeForSelection.page.id);
      const currentAnchorsIds = tree.currentAnchors.list.map(currentAnchor => currentAnchor.id);
      expect(currentAnchorsIds).toEqual(notSelectedFirstLevelPageIdWithAnchors.anchors);
    });
  });
});

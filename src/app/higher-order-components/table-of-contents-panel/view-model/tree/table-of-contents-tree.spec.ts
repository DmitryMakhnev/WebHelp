import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from './table-of-contents-tree';
import { TableOfContentsTreeNode } from './table-of-contents-tree-node';
import { IncorrectFixtureError } from '../../../../../lib/errors/incorrect-fixture-error';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

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

  describe('anchors', () => {
    it('use anchors of first page after creation', () => {
      const tree = createTableOfContentsTree(response);
      const currentAnchorIds = tree.currentAnchors.list.map(anchor => anchor.id);
      expect(currentAnchorIds).toEqual(
        response.entities.pages[response.topLevelIds[0]].anchors || [],
      );
    });

    describe('useAnchorsOfPage', () => {
      it('change current anchors correct', () => {
        const tree = createTableOfContentsTree(response);
        const responsePages = response.entities.pages;
        const fistPage = responsePages[response.topLevelIds[0]];
        const pageForTesting = Object.values(responsePages).find(
          page => page !== fistPage && page.anchors && page.anchors.length !== 0,
        );
        if (!pageForTesting) {
          throw new IncorrectFixtureError('not first page with anchors wasn\'t found');
        }
        tree.useAnchorsOfPage(pageForTesting.id);
        const currentAnchorIds = tree.currentAnchors.list.map(anchor => anchor.id);
        expect(currentAnchorIds).toEqual(pageForTesting.anchors);
      });

      it('current anchors of page without anchors empty', () => {
        const tree = createTableOfContentsTree(response);
        const topLevelPageWithoutAnchors = response.topLevelIds
          .map(pageId => response.entities.pages[pageId])
          .find(page => !page.anchors);
        if (!topLevelPageWithoutAnchors) {
          throw new IncorrectFixtureError('don\'t have top level page without anchors');
        }
        tree.useAnchorsOfPage(topLevelPageWithoutAnchors.id);
        expect(tree.currentAnchors.hasAnchors).toBeFalsy();
      });

      it('list of anchors empty for empty response', () => {
        const tree = createTableOfContentsTree(null);
        tree.useAnchorsOfPage('someId');
        expect(tree.currentAnchors.hasAnchors).toBeFalsy();
      });
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
    describe('selected node', () => {
      it('tree which was created without data has not selected node', () => {
        const tree = createTableOfContentsTree(null);
        expect(tree.selectedNode).toBe(null);
      });

      it('first node had to be selected after init', () => {
        const tree = createTableOfContentsTree(response);
        const firstPageId = response.entities.pages[response.topLevelIds[0]].id;
        expect(tree.selectedNode).toBeDefined();
        expect((tree.selectedNode as TableOfContentsTreeNode).page.id).toBe(firstPageId);
      });

      it('current anchors were updated during select node', () => {
        const tree = createTableOfContentsTree(response);
        const currentSelectedNode = tree.selectedNode;
        if (!currentSelectedNode) {
          throw new IncorrectFixtureError('Don\'t have any page');
        }
        const notSelectedFirstLevelPageIdWithAnchors = response.topLevelIds
          .map(pageId => response.entities.pages[pageId])
          .find(
            firstLevelPage => currentSelectedNode.page.id !== firstLevelPage.id
              && firstLevelPage.anchors && firstLevelPage.anchors.length !== 0,
          );
        if (!notSelectedFirstLevelPageIdWithAnchors) {
          throw new IncorrectFixtureError('Don\'t not first top level page with anchors');
        }
        const newNodeForSelection = tree.children.find(
          node => node.page.id === notSelectedFirstLevelPageIdWithAnchors.id,
        ) as TableOfContentsTreeNode;
        tree.selectNode(newNodeForSelection);
        const currentAnchorsIds = tree.currentAnchors.list.map(currentAnchor => currentAnchor.id);
        expect(currentAnchorsIds).toEqual(notSelectedFirstLevelPageIdWithAnchors.anchors);
      });
    });
  });
});

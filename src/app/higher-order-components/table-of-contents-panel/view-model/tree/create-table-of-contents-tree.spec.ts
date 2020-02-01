import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from './create-table-of-contents-tree';

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
});

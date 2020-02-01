import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from './create-table-of-contents-tree';
import { createTableOfContentsTreeNode } from './create-table-of-contents-tree-node';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

describe('TableOfContentsTreeNode', () => {
  describe('was created without errors', () => {
    it('simplest case', done => {
      const tree = createTableOfContentsTree(response);
      createTableOfContentsTreeNode(tree, response.entities.pages[0]);
      done();
    });
  });
});

import HelpTOCJson from '../../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from '../table-of-contents-tree';
import { IncorrectFixtureError } from '../../../../../../lib/errors/incorrect-fixture-error';
import { TableOfContentsTreeNode } from '../table-of-contents-tree-node';
import { findAllCurrentChildrenOfTree } from './find-all-current-children-of-tree';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

describe('findAllCurrentChildrenOfTree', () => {
  it('works correct', () => {
    const tree = createTableOfContentsTree(response);
    const firstLevelPageWithContent = Object.values(response.entities.pages)
      .find(page => page.level === 0 && page.pages);
    if (!firstLevelPageWithContent) {
      throw new IncorrectFixtureError('Don\'t have any page on first level with sub pages');
    }
    const nodeOfFirstLevelPageWithContent = tree.children.find(
      node => node.page.id === firstLevelPageWithContent.id,
    ) as TableOfContentsTreeNode;
    tree.manageNodeContent(nodeOfFirstLevelPageWithContent, true);
    const buildNodes = findAllCurrentChildrenOfTree(tree);
    const builtNodePageIds = buildNodes.map(node => node.page.id)
      .reduce(
        (nodesIds, nodeId) => nodesIds.add(nodeId),
        new Set<TableOfContentsPageId>(),
      );
    const idsOfPagesMustBeBuilt = response.topLevelIds
      .concat(firstLevelPageWithContent.pages as TableOfContentsPageId[])
      .reduce(
        (pageIds, pageId) => pageIds.add(pageId),
        new Set<TableOfContentsPageId>(),
      );
    expect(builtNodePageIds).toEqual(idsOfPagesMustBeBuilt);
  });
});

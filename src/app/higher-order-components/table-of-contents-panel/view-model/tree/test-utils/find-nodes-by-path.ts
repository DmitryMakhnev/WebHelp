import { TableOfContentsTree } from '../table-of-contents-tree';
import { TableOfContentsTreeNode } from '../table-of-contents-tree-node';

export function findNodesByPath(
  tree: TableOfContentsTree,
  path: TableOfContentsPageId[],
): TableOfContentsTreeNode[] {
  const nodesByPath: TableOfContentsTreeNode[] = [];
  let currentChildrenHolder: TableOfContentsTree | TableOfContentsTreeNode | undefined = tree;
  for (let i = 0; i !== path.length; i += 1) {
    currentChildrenHolder = currentChildrenHolder.children.find(node => node.page.id === path[i]);
    if (!currentChildrenHolder) {
      break;
    }
    nodesByPath.push(currentChildrenHolder);
  }
  return nodesByPath;
}

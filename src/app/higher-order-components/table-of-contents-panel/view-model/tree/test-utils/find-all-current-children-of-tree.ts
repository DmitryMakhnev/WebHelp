import { TableOfContentsTree } from '../table-of-contents-tree';
import { TableOfContentsTreeNode } from '../table-of-contents-tree-node';

export function findAllCurrentChildrenOfTree(tree: TableOfContentsTree): TableOfContentsTreeNode[] {
  let result = tree.children;
  let currentChildren = [...result];
  while (currentChildren.length) {
    const children = currentChildren.shift() as TableOfContentsTreeNode;
    const childrenOfChildren = children.children;
    if (childrenOfChildren.length !== 0) {
      result = result.concat(childrenOfChildren);
      currentChildren = currentChildren.concat(childrenOfChildren);
    }
  }
  return result;
}

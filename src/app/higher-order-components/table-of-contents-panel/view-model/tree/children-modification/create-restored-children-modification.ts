import { TableOfContentsChildrenModification } from './table-of-contents-children-modification';

export function createRestoredChildrenModification(
  childrenRepresentation: TableOfContentsChildrenModification,
): TableOfContentsChildrenModification {
  // sync showed pages states
  const children = childrenRepresentation.children;
  children.forEach((child, index) => {
    const nextChildren = children[index + 1];
    const isSubPagesShowed =
      child.hasChildren && nextChildren && child.currentChildren.has(nextChildren.id);
    child.setIsSubPagesShowed(isSubPagesShowed);
  });

  return {
    modificationType: 'RESTORED',
    children: childrenRepresentation.children,
    modifyingChildren: childrenRepresentation.children,
    bearingItemId: null,
  };
}

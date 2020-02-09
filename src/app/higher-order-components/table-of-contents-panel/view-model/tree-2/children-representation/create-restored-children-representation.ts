import { ChildrenRepresentation } from './children-representation';

export function createRestoredChildrenRepresentation(
  childrenRepresentation: ChildrenRepresentation,
): ChildrenRepresentation {
  // sync showed pages states
  const children = childrenRepresentation.children;
  children.forEach((child, index) => {
    const nextChildren = children[index + 1];
    const isSubPagesShowed = child.hasChildren
      && nextChildren
      && child.currentChildren.has(nextChildren.id);
    child.setIsSubPagesShowed(isSubPagesShowed);
  });

  return {
    modificationType: 'RESTORED',
    children: childrenRepresentation.children,
    modifyingChildren: childrenRepresentation.children,
    bearingItemId: null,
  };
}

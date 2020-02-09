import { ChildrenRepresentation } from './children-representation';

export function createRestoredChildrenRepresentation(
  childrenRepresentation: ChildrenRepresentation,
): ChildrenRepresentation {
  return {
    modificationType: 'RESTORED',
    children: childrenRepresentation.children,
    subPart: childrenRepresentation.children,
    bearingPageId: null,
  };
}

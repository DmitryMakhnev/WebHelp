import { TableOfContentsChildrenModification } from './table-of-contents-children-modification';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';

export function createChildrenAppendedChildrenModification(
  currentChildrenRepresentation: TableOfContentsChildrenModification,
  currentPageViewRepresentation: TableOfContentsPageViewRepresentation,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
): TableOfContentsChildrenModification {
  const appendedChildren: TableOfContentsPageViewRepresentation[] = [];

  currentPageViewRepresentation.currentChildren.forEach(pageId => {
    appendedChildren.push(
      pageViewRepresentationsById.get(pageId) as TableOfContentsPageViewRepresentation,
    );
  });

  const currentChildrenRepresentationChildren = currentChildrenRepresentation.children;
  const currentPageViewRepresentationIndex = currentChildrenRepresentationChildren.findIndex(
    pageViewRepresentation => pageViewRepresentation === currentPageViewRepresentation,
  );

  let newChildren: TableOfContentsPageViewRepresentation[];
  if (currentPageViewRepresentationIndex === currentChildrenRepresentationChildren.length - 1) {
    newChildren = currentChildrenRepresentationChildren.concat(appendedChildren);
  } else {
    const childrenBeforeCurrentRepresentation = currentChildrenRepresentationChildren.slice(
      0,
      currentPageViewRepresentationIndex + 1,
    );

    const childrenAfterCurrentRepresentation = currentChildrenRepresentationChildren.slice(
      currentPageViewRepresentationIndex + 1,
      currentChildrenRepresentationChildren.length,
    );

    newChildren = childrenBeforeCurrentRepresentation.concat(
      appendedChildren,
      childrenAfterCurrentRepresentation,
    );
  }

  return {
    modificationType: 'CHILDREN_APPENDED',
    children: newChildren,
    modifyingChildren: appendedChildren,
    bearingItemId: currentPageViewRepresentation.id,
  };
}

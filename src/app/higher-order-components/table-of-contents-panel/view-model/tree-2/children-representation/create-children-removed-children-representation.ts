import { ChildrenRepresentation } from './children-representation';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';
import { getAllShowedChildrenIdsOfTableOfContentsRepresentation } from '../utils/get-all-showed-children-ids-of-table-of-contents-representation';

export function createChildrenRemovedChildrenRepresentation(
  currentChildrenRepresentation: ChildrenRepresentation,
  currentPageViewRepresentation: TableOfContentsPageViewRepresentation,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
): ChildrenRepresentation {
  const allShowedChildrenIdsOfRepresentation =
    getAllShowedChildrenIdsOfTableOfContentsRepresentation(
      currentPageViewRepresentation,
      pageViewRepresentationsById,
    );

  const currentChildren = currentChildrenRepresentation.children;
  let newChildren: TableOfContentsPageViewRepresentation[];
  let removingChildren: TableOfContentsPageViewRepresentation[];

  const indexOfRemovingRepresentation = currentChildren.findIndex(
    children => children === currentPageViewRepresentation,
  );
  // it means that we remove children from current representation to end of list
  if (allShowedChildrenIdsOfRepresentation.has(
    currentChildren[currentChildren.length - 1].id,
  )) {
    newChildren = currentChildren.slice(0, indexOfRemovingRepresentation + 1);
    removingChildren = currentChildren.slice(
      indexOfRemovingRepresentation + 2,
      currentChildren.length - 1,
    );
  // else remove sub part
  } else {
    let lastRemovingRepresentationIndex = -1;
    for (
      let i = indexOfRemovingRepresentation + 1;
      lastRemovingRepresentationIndex === -1;
      i += 1
    ) {
      const currentPageRepresentation = currentChildren[i];
      if (!allShowedChildrenIdsOfRepresentation.has(currentPageRepresentation.id)) {
        lastRemovingRepresentationIndex = i - 1;
        break;
      }
    }
    newChildren = currentChildren.slice(0, indexOfRemovingRepresentation + 1)
      .concat(
        currentChildren.slice(lastRemovingRepresentationIndex + 1, currentChildren.length),
      );
    removingChildren = currentChildren.slice(
      indexOfRemovingRepresentation + 2,
      lastRemovingRepresentationIndex + 1,
    );
  }

  return {
    modificationType: 'CHILDREN_REMOVED',
    children: newChildren,
    modifyingChildren: removingChildren,
    bearingItemId: currentPageViewRepresentation.id,
  };
}

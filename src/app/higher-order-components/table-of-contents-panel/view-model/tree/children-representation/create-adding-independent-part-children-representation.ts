import { TableOfContentsChildrenModificationRepresentation } from './table-of-contents-children-modification-representation';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { TableOfContentsPageViewRepresentationById } from '../utils/create-page-view-representations-by-id-index';
import { ChunkedListItemsModificationType } from '../../../../../components/chunked-list/types/chunked-list-items-modification-type';
import { getFirstElementFormSet } from '../../../../../../lib/sets/get-first-element-of-set';
import { insertInArrayAfter } from '../../../../../../lib/arrays/insert-in-array-after';

function addPageChildrenIfThemNotAdded(
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
  pageId: TableOfContentsPageId,
  children: TableOfContentsPageViewRepresentation[],
  modifyingChildren: TableOfContentsPageViewRepresentation[],
) {
  let resultChildren: TableOfContentsPageViewRepresentation[] = children;
  let resultModifyingChildren: TableOfContentsPageViewRepresentation[] = modifyingChildren;

  const pageRepresentation = pageViewRepresentationsById.get(pageId) as
    TableOfContentsPageViewRepresentation;
  const currentChildren = pageRepresentation.currentChildren;
  const firstChildId = getFirstElementFormSet(currentChildren);
  const indexOfFirstChildInAllChildren = modifyingChildren.findIndex(
    child => child.id === firstChildId,
  );
  if (indexOfFirstChildInAllChildren === -1) {
    pageRepresentation.setIsSubPagesShowed(true);
    const childRepresentations = Array.from(currentChildren).map(
      id => pageViewRepresentationsById.get(id) as TableOfContentsPageViewRepresentation,
    );
    resultChildren = insertInArrayAfter(
      children,
      childRepresentations,
      pageRepresentation,
    );
    resultModifyingChildren = insertInArrayAfter(
      resultModifyingChildren,
      childRepresentations,
      pageRepresentation,
    );
  }

  return {
    children: resultChildren,
    modifyingChildren: resultModifyingChildren,
  };
}

export function createAddingIndependentPartChildrenRepresentation(
  currentChildrenRepresentation: TableOfContentsChildrenModificationRepresentation,
  currentPageViewRepresentation: TableOfContentsPageViewRepresentation,
  pageViewRepresentationsById: TableOfContentsPageViewRepresentationById,
  pathToPageFromRoot: TableOfContentsPageId[],
  isRequiredToShowChildren: boolean = false,
): TableOfContentsChildrenModificationRepresentation {
  const childrenOfCurrentRepresentation = currentChildrenRepresentation.children;

  let resultChildren: TableOfContentsPageViewRepresentation[] = childrenOfCurrentRepresentation;
  let resultModifyingChildren: TableOfContentsPageViewRepresentation[] = [];
  let resultModificationType: ChunkedListItemsModificationType = 'INTERACTION_WITH';

  // check that new representation in current children
  const indexOfInteractionRepresentationInCurrentChildren = childrenOfCurrentRepresentation
    .findIndex(representation => representation === currentPageViewRepresentation);
  const isRepresentationInCurrentChildren = indexOfInteractionRepresentationInCurrentChildren
    !== -1;

  if (!isRepresentationInCurrentChildren) {
    resultModificationType = 'ADDING_INDEPENDENT_PART';
    // use last level because we dont check last level children
    const iMax = pathToPageFromRoot.length - 1;
    for (let i = 0; i !== iMax; i += 1) {
      const addingResult = addPageChildrenIfThemNotAdded(
        pageViewRepresentationsById,
        pathToPageFromRoot[i],
        resultChildren,
        resultModifyingChildren,
      );
      resultChildren = addingResult.children;
      resultModifyingChildren = addingResult.modifyingChildren;
    }
  }

  if (isRequiredToShowChildren) {
    const addingResult = addPageChildrenIfThemNotAdded(
      pageViewRepresentationsById,
      currentPageViewRepresentation.id,
      resultChildren,
      resultModifyingChildren,
    );
    // if we added new children update results and type
    if (addingResult.children !== resultChildren) {
      resultModificationType = 'ADDING_INDEPENDENT_PART';
      resultChildren = addingResult.children;
      resultModifyingChildren = addingResult.modifyingChildren;
    }
  }

  return {
    modificationType: resultModificationType,
    children: resultChildren,
    modifyingChildren: resultModifyingChildren,
    bearingItemId: currentPageViewRepresentation.id,
  };
}

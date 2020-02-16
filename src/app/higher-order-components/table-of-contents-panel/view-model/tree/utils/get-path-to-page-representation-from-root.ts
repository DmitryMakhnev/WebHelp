import { TableOfContentsPageViewRepresentationById } from './create-page-view-representations-by-id-index';

export function getPathToPageRepresentationFromRoot(
  representationsById: TableOfContentsPageViewRepresentationById,
  pageId: TableOfContentsPageId,
): TableOfContentsPageId[]|null {
  let currentRepresentation = representationsById.get(pageId);
  // don't have start page
  if (!currentRepresentation) {
    return null;
  }

  const result: TableOfContentsPageId[] = [];

  while (currentRepresentation) {
    const parentPageId = currentRepresentation.page.parentId;
    if (!parentPageId) {
      result.unshift(currentRepresentation.id);
      break;
    }
    const idOfPrevPage = currentRepresentation.id;
    currentRepresentation = representationsById.get(parentPageId);
    if (currentRepresentation && !currentRepresentation.currentChildren.has(idOfPrevPage)) {
      return null;
    }
    result.unshift(idOfPrevPage);
  }

  return result;
}

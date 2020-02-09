import { ChildrenRepresentationModificationType } from './children-representation-modification-type';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';

export interface ChildrenRepresentation {
  modificationType: ChildrenRepresentationModificationType;
  children: TableOfContentsPageViewRepresentation[];
  modifyingChildren: TableOfContentsPageViewRepresentation[];
  bearingItemId: TableOfContentsPageId | null;
}

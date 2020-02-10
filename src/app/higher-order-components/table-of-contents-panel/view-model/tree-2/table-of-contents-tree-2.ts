import { action, observable, runInAction } from 'mobx';
import { sortTableOfContentsInputDataForTree } from './utils/sort-table-of-contents-input-data-for-tree';
import { TableOfContentsChildrenModificationRepresentation } from './children-representation/table-of-contents-children-modification-representation';
import { createInitialChildrenRepresentation } from './children-representation/create-initial-children-representation';
import { createFilteredChildrenRepresentation } from './children-representation/create-filtered-children-representation';
import { createRestoredChildrenRepresentation } from './children-representation/create-restored-children-representation';
import { resolveSearchAction } from './utils/resolve-serch-action';
import { createPageViewRepresentations } from './utils/create-page-view-representations';
import { TableOfContentsPageViewRepresentation } from './table-of-contents-page-view-representation';
import {
  createPageViewRepresentationsByIdIndex,
  TableOfContentsPageViewRepresentationById,
} from './utils/create-page-view-representations-by-id-index';
import { createChildrenAppendedChildrenRepresentation } from './children-representation/create-children-appended-children-representation';
import { createChildrenRemovedChildrenRepresentation } from './children-representation/create-children-removed-children-representation';
import { restoreTableOfContentsViewRepresentationChildren } from './utils/restore-table-of-contents-view-representation-children';
import { ChunkedRenderListModificationHolder } from '../../../../components/chunked-render-list/chunked-render-list-modification-holder';

export class TableOfContentsTree2
implements
  ChunkedRenderListModificationHolder<
    TableOfContentsPageViewRepresentation,
    TableOfContentsChildrenModificationRepresentation
  > {
  constructor(private readonly tableOfContents: TableOfContentsApiResponse) {
    const sortedPages = sortTableOfContentsInputDataForTree(tableOfContents);
    this.sortedPageViewRepresentations = createPageViewRepresentations(sortedPages);
    this.pageViewRepresentationsById = createPageViewRepresentationsByIdIndex(
      this.sortedPageViewRepresentations,
    );
    this.childrenModification = createInitialChildrenRepresentation(
      tableOfContents,
      this.pageViewRepresentationsById,
    );
  }

  private sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[];

  private pageViewRepresentationsById: TableOfContentsPageViewRepresentationById;

  // eslint-disable-next-line max-len
  private childrenRepresentationBeforeSearch: TableOfContentsChildrenModificationRepresentation | null = null;

  @observable.ref
  childrenModification: TableOfContentsChildrenModificationRepresentation;

  @observable.ref
  textQuery: string = '';

  private isInSearchMode = false;

  @action.bound
  showSubPages(pageViewRepresentation: TableOfContentsPageViewRepresentation) {
    pageViewRepresentation.setIsSubPagesShowed(true);
    this.childrenModification = createChildrenAppendedChildrenRepresentation(
      this.childrenModification,
      pageViewRepresentation,
      this.pageViewRepresentationsById,
    );
  }

  @action.bound
  hideSubPages(pageViewRepresentation: TableOfContentsPageViewRepresentation) {
    pageViewRepresentation.setIsSubPagesShowed(false);
    this.childrenModification = createChildrenRemovedChildrenRepresentation(
      this.childrenModification,
      pageViewRepresentation,
      this.pageViewRepresentationsById,
    );
  }

  @action.bound
  toggleSubPages(pageViewRepresentation: TableOfContentsPageViewRepresentation) {
    if (pageViewRepresentation.isSubPagesShowed) {
      this.hideSubPages(pageViewRepresentation);
    } else {
      this.showSubPages(pageViewRepresentation);
    }
  }

  @action.bound
  find(textQuery: string) {
    if (textQuery === this.textQuery) {
      return;
    }

    // eslint-disable-next-line default-case
    switch (resolveSearchAction(textQuery, this.isInSearchMode)) {
      case 'START':
        this.isInSearchMode = true;
        this.childrenRepresentationBeforeSearch = this.childrenModification;
        this.childrenModification = createFilteredChildrenRepresentation(
          this.sortedPageViewRepresentations,
          this.pageViewRepresentationsById,
          textQuery,
        );
        break;
      case 'CONTINUE':
        this.childrenModification = createFilteredChildrenRepresentation(
          this.sortedPageViewRepresentations,
          this.pageViewRepresentationsById,
          textQuery,
        );
        break;
      case 'STOP':
        this.isInSearchMode = false;
        restoreTableOfContentsViewRepresentationChildren(this.sortedPageViewRepresentations);
        this.childrenModification = createRestoredChildrenRepresentation(
          this
            // eslint-disable-next-line max-len
            .childrenRepresentationBeforeSearch as TableOfContentsChildrenModificationRepresentation,
        );
        this.childrenRepresentationBeforeSearch = null;
        break;
    }

    this.textQuery = textQuery;
  }
}

export function createTableOfContentsTree2(tableOfContents: TableOfContentsApiResponse) {
  return runInAction(() => new TableOfContentsTree2(tableOfContents));
}

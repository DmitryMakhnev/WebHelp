import { action, computed, observable, runInAction } from 'mobx';
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
import { createAddingIndependentPartChildrenRepresentation } from './children-representation/create-adding-independent-part-children-representation';
import { getPathToPageRepresentationFromRoot } from './utils/get-path-to-page-representation-from-root';
import { Debouncer } from '../../../../../lib/debounce/debouncer';

export class TableOfContentsTree
implements
  ChunkedRenderListModificationHolder<
    TableOfContentsPageViewRepresentation,
    TableOfContentsChildrenModificationRepresentation
  > {
  constructor(private readonly tableOfContents: TableOfContentsApiResponse) {
    const sortedPages = sortTableOfContentsInputDataForTree(tableOfContents);
    this.sortedPageViewRepresentations = createPageViewRepresentations(
      sortedPages,
      tableOfContents,
    );
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

  @computed
  get hasChildrenForDisplaying() {
    return this.childrenModification.children.length !== 0;
  }

  @observable.ref
  textQuery: string = '';

  @observable.ref
  displayingTextQuery: string = '';

  private isInSearchMode = false;

  private currentSelectedPage: TableOfContentsPageViewRepresentation|null = null;

  @action.bound
  showSubPages(pageViewRepresentation: TableOfContentsPageViewRepresentation) {
    if (pageViewRepresentation.hasChildren && !pageViewRepresentation.isSubPagesShowed) {
      pageViewRepresentation.setShouldHaveContentAnimations(true);
      pageViewRepresentation.setIsSubPagesShowed(true);
      this.childrenModification = createChildrenAppendedChildrenRepresentation(
        this.childrenModification,
        pageViewRepresentation,
        this.pageViewRepresentationsById,
      );
    }
  }

  @action.bound
  hideSubPages(pageViewRepresentation: TableOfContentsPageViewRepresentation) {
    if (pageViewRepresentation.hasChildren && pageViewRepresentation.isSubPagesShowed) {
      pageViewRepresentation.setShouldHaveContentAnimations(true);
      pageViewRepresentation.setIsSubPagesShowed(false);
      this.childrenModification = createChildrenRemovedChildrenRepresentation(
        this.childrenModification,
        pageViewRepresentation,
        this.pageViewRepresentationsById,
      );
    }
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
  selectPage(
    pageId: TableOfContentsPageId,
    shouldHaveSelectionAnimations: boolean = false,
  ): boolean {
    const selectionPageView = this.pageViewRepresentationsById.get(pageId);

    const currentSelectedPage = this.currentSelectedPage;
    if (selectionPageView && currentSelectedPage !== selectionPageView) {
      if (currentSelectedPage) {
        currentSelectedPage.setIsSelected(false);
        if (shouldHaveSelectionAnimations &&
          this.childrenModification.children.includes(currentSelectedPage)
        ) {
          currentSelectedPage.setShouldHaveSelectionAnimations(true);
        }
      }
      selectionPageView.setIsSelected(true);
      if (shouldHaveSelectionAnimations) {
        selectionPageView.setShouldHaveSelectionAnimations(true);
      }
      this.currentSelectedPage = selectionPageView;
      return true;
    }

    return false;
  }

  @action.bound
  selectPageFromOutside(
    pageId: TableOfContentsPageId,
    isRequiredToShowChildren: boolean = false,
  ): boolean {
    const isPageWasSelect = this.selectPage(pageId);

    if (isPageWasSelect) {
      const pathToSelectedPageFromRoot = getPathToPageRepresentationFromRoot(
        this.pageViewRepresentationsById,
        pageId,
      ) as TableOfContentsPageId[];
      this.childrenModification = createAddingIndependentPartChildrenRepresentation(
        this.childrenModification,
        this.pageViewRepresentationsById.get(pageId) as TableOfContentsPageViewRepresentation,
        this.pageViewRepresentationsById,
        pathToSelectedPageFromRoot,
        isRequiredToShowChildren,
      );
    }

    return isPageWasSelect;
  }

  @action.bound
  // eslint-disable-next-line class-methods-use-this
  selectAnchor(anchorId: TableOfContentsAnchorId) {
    console.log(`anchor with id '${anchorId}' was selected. Please implement supporting of this`);
  }

  @action.bound
  filter(textQuery: string) {
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

  @observable.ref
  isWaitingFilters: boolean = false;

  private filtrationDebouncer = new Debouncer(
    (textQuery: string) => {
      runInAction(() => {
        this.filter(textQuery);
        this.isWaitingFilters = false;
      });
    },
    150,
  );

  @action.bound
  filterWithDebouncing(textQuery: string) {
    this.displayingTextQuery = textQuery;
    const trimmedQuery = textQuery.trim();
    if (textQuery === '' || trimmedQuery === textQuery || trimmedQuery.length !== 0) {
      this.isWaitingFilters = true;
      this.filtrationDebouncer.run(trimmedQuery);
    }
  }
}

export function createTableOfContentsTree(tableOfContents: TableOfContentsApiResponse) {
  return runInAction(() => new TableOfContentsTree(tableOfContents));
}

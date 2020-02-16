import { action, computed, observable, runInAction } from 'mobx';
import { sortTableOfContentsInputDataForTree } from './utils/sort-table-of-contents-input-data-for-tree';
import { TableOfContentsChildrenModification } from './children-modification/table-of-contents-children-modification';
import { createInitialChildrenModification } from './children-modification/create-initial-children-modification';
import { createFilteredChildrenModification } from './children-modification/create-filtered-children-modification';
import { createRestoredChildrenModification } from './children-modification/create-restored-children-modification';
import { resolveSearchAction } from './utils/resolve-serch-action';
import { createPageViewRepresentations } from './utils/create-page-view-representations';
import { TableOfContentsPageViewRepresentation } from './table-of-contents-page-view-representation';
import {
  createPageViewRepresentationsByIdIndex,
  TableOfContentsPageViewRepresentationById,
} from './utils/create-page-view-representations-by-id-index';
import { createChildrenAppendedChildrenModification } from './children-modification/create-children-appended-children-modification';
import { createChildrenRemovedChildrenModification } from './children-modification/create-children-removed-children-modification';
import { restoreTableOfContentsViewRepresentationChildren } from './utils/restore-table-of-contents-view-representation-children';
import { ChunkedListModificationHolder } from '../../../../components/chunked-list/types/chunked-list-modification-holder';
import { createAddingIndependentPartChildrenModification } from './children-modification/create-adding-independent-part-children-modification';
import { getPathToPageRepresentationFromRoot } from './utils/get-path-to-page-representation-from-root';
import { Debouncer } from '../../../../../lib/debounce/debouncer';

export class TableOfContentsTree
implements
  ChunkedListModificationHolder<
    TableOfContentsPageViewRepresentation,
    TableOfContentsChildrenModification
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
    this.childrenModification = createInitialChildrenModification(
      tableOfContents,
      this.pageViewRepresentationsById,
    );
  }

  private sortedPageViewRepresentations: TableOfContentsPageViewRepresentation[];

  private pageViewRepresentationsById: TableOfContentsPageViewRepresentationById;

  // eslint-disable-next-line max-len
  private childrenModificationBeforeSearch: TableOfContentsChildrenModification | null = null;

  @observable.ref
  childrenModification: TableOfContentsChildrenModification;

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
      this.childrenModification = createChildrenAppendedChildrenModification(
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
      this.childrenModification = createChildrenRemovedChildrenModification(
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
      this.childrenModification = createAddingIndependentPartChildrenModification(
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
        this.childrenModificationBeforeSearch = this.childrenModification;
        this.childrenModification = createFilteredChildrenModification(
          this.sortedPageViewRepresentations,
          this.pageViewRepresentationsById,
          textQuery,
        );
        break;
      case 'CONTINUE':
        this.childrenModification = createFilteredChildrenModification(
          this.sortedPageViewRepresentations,
          this.pageViewRepresentationsById,
          textQuery,
        );
        break;
      case 'STOP':
        this.isInSearchMode = false;
        restoreTableOfContentsViewRepresentationChildren(this.sortedPageViewRepresentations);
        this.childrenModification = createRestoredChildrenModification(
          this
            // eslint-disable-next-line max-len
            .childrenModificationBeforeSearch as TableOfContentsChildrenModification,
        );
        this.childrenModificationBeforeSearch = null;
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

  @action
  private prepareTextQuery(textQuery: string) {
    this.displayingTextQuery = textQuery;
    const trimmedQuery = textQuery.trim();
    return {
      trimmedQuery,
      canFilter: textQuery === '' || trimmedQuery === textQuery || trimmedQuery.length !== 0,
    };
  }

  @action.bound
  filteringFormOutside(textQuery: string) {
    const preparingQuery = this.prepareTextQuery(textQuery);
    if (preparingQuery.canFilter) {
      this.filter(preparingQuery.trimmedQuery);
    }
  }

  @action.bound
  filterWithDebouncing(textQuery: string) {
    const preparingQuery = this.prepareTextQuery(textQuery);
    if (preparingQuery.canFilter) {
      this.isWaitingFilters = true;
      this.filtrationDebouncer.run(preparingQuery.trimmedQuery);
    }
  }
}

export function createTableOfContentsTree(tableOfContents: TableOfContentsApiResponse) {
  return runInAction(() => new TableOfContentsTree(tableOfContents));
}

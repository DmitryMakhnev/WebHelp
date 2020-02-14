import HelpTOCJson from '../../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsTree } from './table-of-contents-tree';
import { IncorrectFixtureError } from '../../../../../lib/errors/incorrect-fixture-error';
import { insertInArrayAfter } from '../../../../../lib/arrays/insert-in-array-after';
import { getIdsOfItemsAsArray } from '../../../../components/chunked-render-list/chunks/test-utils/get-ids-of-items-as-array';
import { TableOfContentsPageViewRepresentation } from './table-of-contents-page-view-representation';

const tableOfContentsFixture: TableOfContentsApiResponse = (HelpTOCJson as unknown) as
  TableOfContentsApiResponse;

describe('TableOfContentsTree', () => {
  // TODO [dmitry.makhnev]: add all tests for all cases
  describe('selectPageFromOutside', () => {
    // TODO [dmitry.makhnev]: check page representations states
    it('select top level page', () => {
      const firstFirsLevelPageId = tableOfContentsFixture.topLevelIds[0];
      const tree = createTableOfContentsTree(tableOfContentsFixture);
      const childrenBeforeSelection = tree.childrenModification.children;
      tree.selectPageFromOutside(firstFirsLevelPageId);
      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('INTERACTION_WITH');
      expect(childrenModificationAfterSelection.children).toEqual(childrenBeforeSelection);
      expect(childrenModificationAfterSelection.modifyingChildren).toEqual([]);
      expect(childrenModificationAfterSelection.bearingItemId).toBe(firstFirsLevelPageId);
    });

    it('select page of not first level when it\'s built', () => {
      const pages = tableOfContentsFixture.entities.pages;
      const firstSecondLevelPage = Object.values(pages).find(page => page.level === 1);
      if (!firstSecondLevelPage) {
        throw new IncorrectFixtureError('we dont have any page on second level');
      }
      const parentOfSelectedNode = pages[firstSecondLevelPage.parentId as TableOfContentsPageId] as
        TableOfContentsPage;
      const childrenIdsOfParentOfSelectedNode = parentOfSelectedNode.pages as
        TableOfContentsPageId[];
      const sortedResultPageIds = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        childrenIdsOfParentOfSelectedNode,
        parentOfSelectedNode.id,
      );
      const firstSecondLevelPageId = firstSecondLevelPage.id;

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      const parentRepresentationOfSelectedPage = tree.childrenModification.children.find(
        representation => representation.id === parentOfSelectedNode.id,
      ) as TableOfContentsPageViewRepresentation;
      tree.showSubPages(parentRepresentationOfSelectedPage);
      tree.selectPageFromOutside(firstSecondLevelPageId);
      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('INTERACTION_WITH');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(sortedResultPageIds);
      expect(childrenModificationAfterSelection.modifyingChildren).toEqual([]);
      expect(childrenModificationAfterSelection.bearingItemId).toBe(firstSecondLevelPageId);
    });

    it('select page of second level when it isn\'t built', () => {
      const pages = tableOfContentsFixture.entities.pages;
      const firstSecondLevelPage = Object.values(pages).find(page => page.level === 1);
      if (!firstSecondLevelPage) {
        throw new IncorrectFixtureError('we dont have any page on second level');
      }
      const parentOfSelectedNode = pages[firstSecondLevelPage.parentId as TableOfContentsPageId] as
        TableOfContentsPage;
      const childrenIdsOfParentOfSelectedNode = parentOfSelectedNode.pages as
        TableOfContentsPageId[];
      const sortedResultPageIds = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        childrenIdsOfParentOfSelectedNode,
        parentOfSelectedNode.id,
      );
      const firstSecondLevelPageId = firstSecondLevelPage.id;

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      tree.selectPageFromOutside(firstSecondLevelPageId);
      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('ADDING_INDEPENDENT_PART');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(sortedResultPageIds);
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.modifyingChildren),
      ).toEqual(childrenIdsOfParentOfSelectedNode);
      expect(childrenModificationAfterSelection.bearingItemId).toBe(firstSecondLevelPageId);
    });

    it('select page of third level when  isn\'t built', () => {
      const pages = tableOfContentsFixture.entities.pages;
      const firstThirdLevelPage = Object.values(pages).find(page => page.level === 2);
      if (!firstThirdLevelPage) {
        throw new IncorrectFixtureError('we dont have any page on third level');
      }
      const secondLevelPage = pages[firstThirdLevelPage.parentId as TableOfContentsPageId] as
        TableOfContentsPage;
      const childrenOfSecondLevel = secondLevelPage.pages as TableOfContentsPageId[];
      const fistLevelPage = pages[secondLevelPage.parentId as TableOfContentsPageId] as
        TableOfContentsPage;
      const childrenFirstLevel = fistLevelPage.pages as TableOfContentsPageId[];

      const sortedResultModifyingChildrenIds = insertInArrayAfter(
        childrenFirstLevel,
        childrenOfSecondLevel,
        secondLevelPage.id,
      );

      const sortedResultChildrenIds = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        sortedResultModifyingChildrenIds,
        fistLevelPage.id,
      );
      const firstThirdLevelPageId = firstThirdLevelPage.id;

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      tree.selectPageFromOutside(firstThirdLevelPageId);
      const childrenModificationAfterSelection = tree.childrenModification;

      expect(childrenModificationAfterSelection.modificationType).toEqual('ADDING_INDEPENDENT_PART');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(sortedResultChildrenIds);
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.modifyingChildren),
      ).toEqual(sortedResultModifyingChildrenIds);
      expect(childrenModificationAfterSelection.bearingItemId).toBe(firstThirdLevelPageId);
    });

    it('select first level page with not built children with flag for showing', () => {
      const firstLevelPageWithChildren = Object.values(tableOfContentsFixture.entities.pages)
        .find(page => page.level === 0 && page.pages);
      if (!firstLevelPageWithChildren || !firstLevelPageWithChildren.pages) {
        throw new IncorrectFixtureError('we dont have page of first level with children');
      }
      const firstLevelPageWithChildrenId = firstLevelPageWithChildren.id;
      const resultChildrenIds = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        firstLevelPageWithChildren.pages,
        firstLevelPageWithChildrenId,
      );
      const modifyingChildrenPageIds = firstLevelPageWithChildren.pages;

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      tree.selectPageFromOutside(firstLevelPageWithChildrenId, true);

      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('ADDING_INDEPENDENT_PART');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(
        resultChildrenIds,
      );
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.modifyingChildren),
      ).toEqual(
        modifyingChildrenPageIds,
      );
      expect(childrenModificationAfterSelection.bearingItemId).toBe(firstLevelPageWithChildrenId);
    });

    it('select page when other part is opened with flag for showing', () => {
      const pages = tableOfContentsFixture.entities.pages;
      const firstFirstLevelPageWithChildren = Object.values(pages).find(
        page => page.level === 0 && page.pages,
      );
      if (!firstFirstLevelPageWithChildren || !firstFirstLevelPageWithChildren.pages) {
        throw new IncorrectFixtureError('we dont have any level page with children');
      }
      const secondFirstLevelPageWithChildren = Object.values(pages).find(
        page => page.level === 0 && page !== firstFirstLevelPageWithChildren && page.pages,
      );
      if (!secondFirstLevelPageWithChildren || !secondFirstLevelPageWithChildren.pages) {
        throw new IncorrectFixtureError('we dont have second first level page with children');
      }

      const firstFirstLevelPageWithChildrenId = firstFirstLevelPageWithChildren.id;
      const secondFirstLevelPageWithChildrenId = secondFirstLevelPageWithChildren.id;
      const modifyingChildrenIds = secondFirstLevelPageWithChildren.pages;
      const resultPageIdsAfterShowing = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        firstFirstLevelPageWithChildren.pages,
        firstFirstLevelPageWithChildrenId,
      );
      const resultPageIdsAfterSelection = insertInArrayAfter(
        resultPageIdsAfterShowing,
        modifyingChildrenIds,
        secondFirstLevelPageWithChildrenId,
      );

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      // prepare showed part
      const parentRepresentationOfSelectedPage = tree.childrenModification.children.find(
        representation => representation.id === firstFirstLevelPageWithChildrenId,
      ) as TableOfContentsPageViewRepresentation;
      tree.showSubPages(parentRepresentationOfSelectedPage);
      // select
      tree.selectPageFromOutside(secondFirstLevelPageWithChildrenId, true);

      // checking
      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('ADDING_INDEPENDENT_PART');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(
        resultPageIdsAfterSelection,
      );
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.modifyingChildren),
      ).toEqual(
        modifyingChildrenIds,
      );
      expect(childrenModificationAfterSelection.bearingItemId)
        .toBe(secondFirstLevelPageWithChildrenId);
    });

    it('select page when level with selection not built and with with flag for showing', () => {
      const pages = tableOfContentsFixture.entities.pages;
      const firstSecondLevelPageWithChildren = Object.values(pages).find(
        page => page.level === 1 && page.pages,
      );
      if (!firstSecondLevelPageWithChildren || !firstSecondLevelPageWithChildren.pages) {
        throw new IncorrectFixtureError('we dont have second level page with children');
      }

      const firstLevelPageId = firstSecondLevelPageWithChildren.parentId as TableOfContentsPageId;
      const fistLevelPage = pages[firstLevelPageId] as TableOfContentsPage;
      const firstLevelPageChildrenIds = fistLevelPage.pages as TableOfContentsPageId[];

      const secondLevelPageId = firstSecondLevelPageWithChildren.id;
      const secondLevelPageChildrenIds = firstSecondLevelPageWithChildren
        .pages as TableOfContentsPageId[];

      const resultModifyingChildrenIds = insertInArrayAfter(
        firstLevelPageChildrenIds,
        secondLevelPageChildrenIds,
        secondLevelPageId,
      );

      const resultChildrenIds = insertInArrayAfter(
        tableOfContentsFixture.topLevelIds,
        resultModifyingChildrenIds,
        firstLevelPageId,
      );

      const tree = createTableOfContentsTree(tableOfContentsFixture);
      tree.selectPageFromOutside(secondLevelPageId, true);

      // checking
      const childrenModificationAfterSelection = tree.childrenModification;
      expect(childrenModificationAfterSelection.modificationType).toEqual('ADDING_INDEPENDENT_PART');
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.children),
      ).toEqual(
        resultChildrenIds,
      );
      expect(
        getIdsOfItemsAsArray(childrenModificationAfterSelection.modifyingChildren),
      ).toEqual(
        resultModifyingChildrenIds,
      );
      expect(childrenModificationAfterSelection.bearingItemId)
        .toBe(secondLevelPageId);
    });
  });
});

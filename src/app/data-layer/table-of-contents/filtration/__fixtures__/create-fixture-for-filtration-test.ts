import { IncorrectFixtureError } from '../../../../../lib/errors/incorrect-fixture-error';
import { checkPageMatchingForFilter } from './check-page-matching-for-filter';

interface SimpleFixtureForFiltrationTest {
  tableOfContent: TableOfContentsApiResponse,
  letterForTextFiltering: string,
  matchedIds: Set<TableOfContentsPageId>
}

/**
 * @description create fixture for filtering with
 *  two matchable pages of second level
 *  and extra unmatchable page of top level
 */
export function createFixtureForFiltrationTest(
  bigTableOfContentsFixture: TableOfContentsApiResponse,
): SimpleFixtureForFiltrationTest {
  const pagesFromData = bigTableOfContentsFixture.entities.pages;
  const pages = Object.values(pagesFromData);
  const firstPageOfSecondLevel = pages.find(page => page.level === 1);
  if (!firstPageOfSecondLevel) {
    throw new IncorrectFixtureError('Don\'t have any page on second level');
  }
  const firstLetterTitleOfFirstPage = firstPageOfSecondLevel.title.charAt(0);
  const secondPagePageOfSecondLevel = pages.find(
    page => page.level === 1
      && page !== firstPageOfSecondLevel
      && checkPageMatchingForFilter(page, firstLetterTitleOfFirstPage),
  );
  if (!secondPagePageOfSecondLevel) {
    throw new IncorrectFixtureError(
      'Don\'t have any page on second level which title contains same char as first char of first second level page',
    );
  }
  const parentOfFirstPage = pagesFromData[firstPageOfSecondLevel.parentId as TableOfContentsPageId];
  const parentOfSecondPage = pagesFromData[
    secondPagePageOfSecondLevel.parentId as TableOfContentsPageId
  ];
  const unmatchedTopLevelPage = pages.find(
    page => page.level === 0
      && page !== parentOfFirstPage
      && page !== parentOfSecondPage
      && !checkPageMatchingForFilter(page, firstLetterTitleOfFirstPage),
  );
  if (!unmatchedTopLevelPage) {
    throw new IncorrectFixtureError(
      'Don\'t have any top level page which title doesn\'t contain same char as first char of first second level page',
    );
  }
  const topLevelPagesIds = Array.from(new Set<TableOfContentsPageId>(
    [parentOfFirstPage.id, parentOfSecondPage.id, unmatchedTopLevelPage.id],
  ));
  const simpleFixture: TableOfContentsApiResponse = {
    entities: {
      pages: {
        [parentOfFirstPage.id]: firstPageOfSecondLevel,
        [firstPageOfSecondLevel.id]: firstPageOfSecondLevel,
        [parentOfSecondPage.id]: parentOfSecondPage,
        [secondPagePageOfSecondLevel.id]: secondPagePageOfSecondLevel,
        [unmatchedTopLevelPage.id]: unmatchedTopLevelPage,
      },
      anchors: bigTableOfContentsFixture.entities.anchors,
    },
    topLevelIds: topLevelPagesIds,
  };

  const matchedIds = new Set(
    Object.keys(simpleFixture.entities.pages).filter(id => id !== unmatchedTopLevelPage.id),
  );

  return {
    tableOfContent: simpleFixture,
    letterForTextFiltering: firstLetterTitleOfFirstPage,
    matchedIds,
  };
}

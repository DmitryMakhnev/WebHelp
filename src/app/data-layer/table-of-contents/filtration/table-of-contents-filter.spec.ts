import HelpTOCJson from '../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { createTableOfContentsFilter } from './table-of-contents-filter';
import { IncorrectFixtureError } from '../../../../lib/errors/incorrect-fixture-error';
import { getPagesPathToPageFromRoot } from '../get-pages-path-to-page-from-root';
import { getUniqueValuesOfFieldOfAllPages } from '../test-utils/get-unique-values-of-field-of-all-pages';
import { createFixtureForFiltrationTest } from './__fixtures__/create-fixture-for-filtration-test';

const response: TableOfContentsApiResponse = (HelpTOCJson as unknown) as TableOfContentsApiResponse;

describe('TableOfContentsFilter', () => {
  it('creation', done => {
    createTableOfContentsFilter(response);
    done();
  });

  it('creation with null data', done => {
    createTableOfContentsFilter(null);
    done();
  });

  it('correct state after creation', () => {
    const filter = createTableOfContentsFilter(response);
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.wasFiltered).toBeFalsy();
    expect(filtrationResult.hasMatched).toBeFalsy();
    expect(filtrationResult.textFilter).toBe(null);
    expect(filtrationResult.tableOfContent).toBe(null);
  });

  it('correct state after filtration when data is null', () => {
    const filter = createTableOfContentsFilter(null);
    const filtrationText = 'text for filtration of null';
    filter.filterByText(filtrationText);
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.wasFiltered).toBeTruthy();
    expect(filtrationResult.hasMatched).toBeFalsy();
    expect(filtrationResult.textFilter).toBe(filtrationText);
    expect(filtrationResult.tableOfContent).toBe(null);
  });

  it('filtration result of not matched result by text', () => {
    const filter = createTableOfContentsFilter(response);
    const pagesFromData = response.entities.pages;
    const uniquePagesTitles = getUniqueValuesOfFieldOfAllPages(pagesFromData, 'title');
    const notMatchableTitle = `${uniquePagesTitles.values().next()}!`;
    filter.filterByText(notMatchableTitle);
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.wasFiltered).toBeTruthy();
    expect(filtrationResult.hasMatched).toBeFalsy();
    expect(filtrationResult.textFilter).toBe(notMatchableTitle);
    expect(filtrationResult.tableOfContent).toBe(null);
  });

  it('some level page was found', () => {
    const filter = createTableOfContentsFilter(response);
    const pagesFromData = response.entities.pages;
    const thirdLevelPage = Object.values(pagesFromData).find(page => page.level === 2);
    if (!thirdLevelPage || !thirdLevelPage.parentId) {
      throw new IncorrectFixtureError("Don't have any page on third level");
    }
    const pageTitle = thirdLevelPage.title;
    filter.filterByText(thirdLevelPage.title);
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.wasFiltered).toBeTruthy();
    expect(filtrationResult.hasMatched).toBeTruthy();
    expect(filtrationResult.textFilter).toBe(pageTitle);
    expect(
      (filtrationResult.tableOfContent as TableOfContentsApiResponse).entities.pages[
        thirdLevelPage.id
      ],
    ).toEqual(thirdLevelPage);
  });

  it('filtration result contains parents pages of matched page', () => {
    const pagesFromData = response.entities.pages;
    const thirdLevelPage = Object.values(pagesFromData).find(
      page =>
        page.level === 2 && page.parentId && pagesFromData[page.parentId].title !== page.title,
    );
    if (!thirdLevelPage || !thirdLevelPage.parentId) {
      throw new IncorrectFixtureError(
        "Don't have any page on third level with parent with different title",
      );
    }
    const filter = createTableOfContentsFilter(response);
    filter.filterByText(thirdLevelPage.title);
    const filtrationResultPages = (filter.filtrationResult
      .tableOfContent as TableOfContentsApiResponse).entities.pages;
    const pathToPage = getPagesPathToPageFromRoot(
      response,
      thirdLevelPage.id,
    ) as TableOfContentsPageId[];
    expect(filtrationResultPages[pathToPage[0]]).toBeDefined();
    expect(filtrationResultPages[pathToPage[1]]).toBeDefined();
  });

  it('found only matched pages', () => {
    const simpleFixture = createFixtureForFiltrationTest(response);
    const filter = createTableOfContentsFilter(simpleFixture.tableOfContent);
    filter.filterByText(simpleFixture.letterForTextFiltering);
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.foundPageIds).toEqual(simpleFixture.matchedIds);
    const foundPagesIdsFromPages = new Set(
      Object.keys((filtrationResult.tableOfContent as TableOfContentsApiResponse).entities.pages),
    );
    expect(foundPagesIdsFromPages).toEqual(simpleFixture.matchedIds);
  });

  it('rest', () => {
    const filter = createTableOfContentsFilter(response);
    const fistPage = response.entities.pages[response.topLevelIds[0]];
    if (!fistPage) {
      throw new IncorrectFixtureError("Don't have any page");
    }
    filter.filterByText(fistPage.title);
    filter.rest();
    const filtrationResult = filter.filtrationResult;
    expect(filtrationResult.wasFiltered).toBeFalsy();
    expect(filtrationResult.hasMatched).toBeFalsy();
    expect(filtrationResult.textFilter).toBe(null);
    expect(filtrationResult.tableOfContent).toBe(null);
  });
});

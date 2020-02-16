import HelpTOCJson from '../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { getPagesPathToPageFromRoot } from './get-pages-path-to-page-from-root';
import { findFirstPageOfLevel } from './test-utils/find-first-page-of-level';
import { IncorrectFixtureError } from '../../../lib/errors/incorrect-fixture-error';

const response: TableOfContentsApiResponse = (HelpTOCJson as unknown) as TableOfContentsApiResponse;

describe('getPagesPathToPageFromRoot', () => {
  it('works correct', () => {
    const pageOfThirdLevel = findFirstPageOfLevel(response, 2);
    if (!pageOfThirdLevel) {
      throw new IncorrectFixtureError("don't have any page of this level");
    }
    const path = getPagesPathToPageFromRoot(
      response,
      pageOfThirdLevel.id,
    ) as TableOfContentsPageId[];
    const rootPageId = path[0];
    const secondLevelPageId = path[1];
    const thirdLevelPageId = path[2];
    const pages = response.entities.pages;

    expect(path.length).toBe(3);

    expect(pages[rootPageId].level).toBe(0);

    expect(pages[secondLevelPageId].level).toBe(1);
    expect(pages[secondLevelPageId].parentId).toBe(pages[rootPageId].id);

    expect(pages[thirdLevelPageId].level).toBe(2);
    expect(pages[thirdLevelPageId].parentId).toBe(pages[secondLevelPageId].id);
  });

  it('return null if page is not exist', () => {
    const path = getPagesPathToPageFromRoot(response, '__NOT_EXIST_PAGE_ID__');
    expect(path).toBe(null);
  });
});

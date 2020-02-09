import { sortTableOfContentsInputDataForTree } from './sort-table-of-contents-input-data-for-tree';
import {
  smallTableOfContentForSortingFixture,
  smallTableOfContentForSortingIdsOrderFixture,
} from './__fixtures__/small-table-of-content-for-sorting.fixture';

describe('sortTableOfContentsInputDataForTree', () => {
  it('order is correct', () => {
    const sortedResult = sortTableOfContentsInputDataForTree(smallTableOfContentForSortingFixture);
    const ids = sortedResult.map(page => page.id);
    expect(ids).toEqual(smallTableOfContentForSortingIdsOrderFixture);
  });
});

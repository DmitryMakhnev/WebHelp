import HelpTOCJson from '../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { findFirstPageOfLevel } from './find-first-page-of-level';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

describe('findFirstPageOfLevel', () => {
  it('works correct', () => {
    const page = findFirstPageOfLevel(response, 2);
    expect(page.level).toBe(2);
  });
});

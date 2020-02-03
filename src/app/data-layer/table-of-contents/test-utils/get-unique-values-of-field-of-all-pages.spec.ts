import HelpTOCJson from '../../../../../stub-server/public/api/2019.3/HelpTOC.json';
import { getUniqueValuesOfFieldOfAllPages } from './get-unique-values-of-field-of-all-pages';

const response: TableOfContentsApiResponse = HelpTOCJson as unknown as TableOfContentsApiResponse;

describe('getUniqueValuesOfFieldOfAllPages', () => {
  it('works correct', () => {
    const pages = response.entities.pages;
    const fieldKey: keyof TableOfContentsPage = 'id';
    const uniqueSetValues = getUniqueValuesOfFieldOfAllPages(pages, fieldKey);
    expect(uniqueSetValues.size).not.toBe(0);
    Object.values(pages).forEach(page => {
      const value = page[fieldKey];
      if (uniqueSetValues.has(value)) {
        uniqueSetValues.delete(value);
      } else {
        throw new Error('result doesn\'t contain one of values');
      }
    });
    expect(uniqueSetValues.size).toBe(0);
  });
});

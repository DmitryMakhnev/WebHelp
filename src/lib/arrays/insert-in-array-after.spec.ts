import { insertInArrayAfter } from './insert-in-array-after';

describe('insertInArrayAfter', () => {
  it('with item', () => {
    const result = insertInArrayAfter(['1', '2', '3'], '2.1', '2');
    expect(result).toEqual(['1', '2', '2.1', '3']);
  });
  it('with predicate', () => {
    const result = insertInArrayAfter(
      ['1', '2', '3'],
      '2.1',
      null,
      item => item === '2',
    );
    expect(result).toEqual(['1', '2', '2.1', '3']);
  });
  it('works with inserting items', () => {
    const result = insertInArrayAfter(['1', '2', '3'], ['2.1', '2.2'], '2');
    expect(result).toEqual(['1', '2', '2.1', '2.2', '3']);
  });
  it('inset in the end when element not found', () => {
    const result = insertInArrayAfter(['1', '2', '3'], ['2.1', '2.2'], '-2');
    expect(result).toEqual(['1', '2', '3', '2.1', '2.2']);
  });
});

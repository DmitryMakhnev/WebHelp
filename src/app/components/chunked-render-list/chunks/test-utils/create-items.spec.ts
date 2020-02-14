import { createItems } from './create-items';

describe('createItems', () => {
  it('simple creation', () => {
    const items = createItems(0, 5);
    const ids = items.map(item => item.id);
    expect(ids).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('creation with prefix', () => {
    const items = createItems(0, 1, 'test_');
    const ids = items.map(item => item.id);
    expect(ids).toEqual(['test_0', 'test_1']);
  });
});

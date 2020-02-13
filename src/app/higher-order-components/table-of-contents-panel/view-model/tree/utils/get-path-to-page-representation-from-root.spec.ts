import {
  createPageViewRepresentationsByIdIndex,
  TableOfContentsPageViewRepresentationById
} from './create-page-view-representations-by-id-index';
import { TableOfContentsPageViewRepresentation } from '../table-of-contents-page-view-representation';
import { getPathToPageRepresentationFromRoot } from './get-path-to-page-representation-from-root';
import { createPageViewRepresentations } from './create-page-view-representations';

const pagesFixture: TableOfContentsPage[] = [
  {
    id: '1',
    pages: ['1.1', '1.2'],
    level: 0,
    title: '1',
  },
  {
    id: '1.1',
    pages: ['1.1.1'],
    level: 1,
    title: '1.1',
    parentId: '1',
  },
  {
    id: '1.1.1',
    level: 2,
    title: '1.1.1',
    parentId: '1.1',
  },
  {
    id: '1.2',
    level: 1,
    title: '1.2',
    parentId: '1',
  },
  {
    id: '2',
    level: 0,
    title: '2',
  },
];

function createRepresentationsByIds() {
  const representations = createPageViewRepresentations(pagesFixture);
  return createPageViewRepresentationsByIdIndex(representations);
}

describe('getPathToPageRepresentationFromRoot', () => {
  it('for exist page', () => {
    const representationsById = createRepresentationsByIds();
    const path = getPathToPageRepresentationFromRoot(representationsById, '1.1.1');
    expect(path).toEqual(['1', '1.1', '1.1.1']);
  });
  it('for not exist page', () => {
    const representationsById = createRepresentationsByIds();
    const path = getPathToPageRepresentationFromRoot(representationsById, '2.2.2');
    expect(path).toEqual(null);
  });
  it('exist page with changes current children is not found', () => {
    const representationsById = createRepresentationsByIds();
    const someRepresentation = representationsById.get('1') as TableOfContentsPageViewRepresentation;
    someRepresentation.currentChildren = new Set<TableOfContentsPageId>();
    const path = getPathToPageRepresentationFromRoot(representationsById, '1.1.1');
    expect(path).toBe(null);
  });
});

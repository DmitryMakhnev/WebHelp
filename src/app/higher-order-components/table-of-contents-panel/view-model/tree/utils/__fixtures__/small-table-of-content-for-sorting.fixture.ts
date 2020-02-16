export const smallTableOfContentForSortingFixture: TableOfContentsApiResponse = {
  entities: {
    pages: {
      l_0_1: {
        id: 'l_0_1',
        title: '',
        level: 0,
        url: '',
        pages: ['l_1_1'],
      },
      l_0_2: {
        id: 'l_0_2',
        title: '',
        level: 0,
        url: '',
        pages: ['l_1_2'],
      },
      l_1_1: {
        id: 'l_1_1',
        title: '',
        level: 0,
        url: '',
        pages: ['l_2_1'],
      },
      l_2_1: {
        id: 'l_2_1',
        title: '',
        level: 0,
        url: '',
      },
      l_1_2: {
        id: 'l_1_2',
        title: '',
        level: 0,
        url: '',
      },
    },
    anchors: {},
  },
  topLevelIds: ['l_0_1', 'l_0_2'],
};

export const smallTableOfContentForSortingIdsOrderFixture: TableOfContentsPageId[] = [
  'l_0_1',
  'l_1_1',
  'l_2_1',
  'l_0_2',
  'l_1_2',
];

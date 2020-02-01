type TableOfContentsPageId = string;
type TableOfContentsAnchorId = string;

interface TableOfContentsPage {
  id: TableOfContentsPageId;
  parentId?: TableOfContentsPageId;
  title?: string;
  url?: string;
  level: number;
  pages?: TableOfContentsPageId[];
  anchors?: TableOfContentsAnchorId;
}

interface TableOfContentsAnchor {
  id: TableOfContentsAnchorId;
  parentId: TableOfContentsPageId;
  title: string;
  url: string;
  anchor: string;
  level: number;
}

interface TableOfContentsApiResponse {
  entities: {
    pages: Record<TableOfContentsPageId, TableOfContentsPage>;
    anchors: Record<TableOfContentsAnchorId, TableOfContentsAnchor>;
  };
  topLevelIds: TableOfContentsPageId[];
}

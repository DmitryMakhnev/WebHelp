import { createContext } from 'react';
import { TableOfContentsFetchingController } from '../data-layer/table-of-contents/table-of-contents-fetching.controller';
import { TableOfContentsModel } from '../data-layer/table-of-contents/table-of-contents.model';

interface DataLayerConnectionContextValue {
  tableOfContentsModel: TableOfContentsModel;
  tableOfContentsFetchingController: TableOfContentsFetchingController;
}

function createDefaultDataLayerConnectionContextValue(): DataLayerConnectionContextValue {
  const tableOfContentsModel = new TableOfContentsModel();
  return {
    tableOfContentsFetchingController: new TableOfContentsFetchingController(
      tableOfContentsModel
    ),
    tableOfContentsModel,
  };
}

export const DataLayerConnectionContext = createContext<
  DataLayerConnectionContextValue
>(createDefaultDataLayerConnectionContextValue());

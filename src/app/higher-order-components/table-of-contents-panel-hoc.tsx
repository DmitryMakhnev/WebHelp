import React, { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { TableOfContentsPanel } from '../components/table-of-contents-panel/table-of-contents-panel';
import { DataLayerConnectionContext } from '../contexts/data-layer-connection.context';

export type TableOfContentsPanelHOCProps = {
  className?: string;
};

export const TableOfContentsPanelHoc: FC<TableOfContentsPanelHOCProps> = observer(props => {
  const dataLayerConnection = useContext(DataLayerConnectionContext);

  useEffect(() => {
    dataLayerConnection.tableOfContentsFetchingController.fetch().catch(() => {
      // TODO [dmitry.makhnev]: log
    });
  }, []);
  return (
    <TableOfContentsPanel
      className={props.className}
      dataState={dataLayerConnection.tableOfContentsModel.fetchingDataState.state}
    />
  );
});

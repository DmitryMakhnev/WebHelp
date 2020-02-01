import React,
{
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';
import { observer } from 'mobx-react';
import { TableOfContentsPanel } from '../../components/table-of-contents-panel/table-of-contents-panel';
import { DataLayerConnectionContext } from '../../contexts/data-layer-connection.context';
import { createTableOfContentsPanelViewModel } from './view-model/table-of-contents-panel.view-model';

export type TableOfContentsPanelHOCProps = {
  className?: string;
};

export const TableOfContentsPanelHoc: FC<TableOfContentsPanelHOCProps> = observer(props => {
  console.log('render hoc');

  const dataLayerConnection = useContext(DataLayerConnectionContext);
  useEffect(() => {
    console.log('hok run effect');
    dataLayerConnection.tableOfContentsFetchingController.fetch().catch(() => {
      // TODO [dmitry.makhnev]: log
    });
  }, []);

  const [tableOfContentsViewModel] = useState(
    () => createTableOfContentsPanelViewModel(
      dataLayerConnection.tableOfContentsModel,
    ),
  );

  return (
    <TableOfContentsPanel
      className={props.className}
      dataState={dataLayerConnection.tableOfContentsModel.fetchingDataState.state}
      viewModel={tableOfContentsViewModel}
    />
  );
});

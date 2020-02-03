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

  const [tableOfContentsViewModel] = useState(
    () => createTableOfContentsPanelViewModel(
      dataLayerConnection.tableOfContentsModel,
    ),
  );

  useEffect(() => {
    console.log('hok run effect');
    WEB_HELP_OUTSIDE_API.selectByPageId = pageId => tableOfContentsViewModel
      .tree.selectByPageId(pageId, true);
    WEB_HELP_OUTSIDE_API.filterByText = text => tableOfContentsViewModel.tree.filterByText(text);

    dataLayerConnection.tableOfContentsFetchingController.fetch().catch(() => {
      // TODO [dmitry.makhnev]: log
    });
  }, []);

  return (
    <TableOfContentsPanel
      className={props.className}
      dataState={dataLayerConnection.tableOfContentsModel.fetchingDataState.state}
      viewModel={tableOfContentsViewModel}
    />
  );
});

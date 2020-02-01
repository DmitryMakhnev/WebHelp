import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-panel.scss';
import { TableOfContentsList } from '../table-of-contents-list/table-of-contents-list';
import { TableOfContentsPanelViewModel } from '../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';

export interface TableOfContentsPanelProps {
  className?: string;
  dataState: FetchingDataState;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = observer(props => {
  const tree = props.viewModel.tree;
  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>
      {tree.currentAnchors.list.map(
        anchor => <div key={anchor.id}>{anchor.title}</div>,
      )}
      <hr />
      {props.dataState}
      <TableOfContentsList tree={tree} />
    </div>
  );
});

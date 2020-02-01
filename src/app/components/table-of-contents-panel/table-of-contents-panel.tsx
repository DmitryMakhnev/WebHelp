import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './table-of-contents-panel.scss';
import { TableOfContentsList } from '../table-of-contents-list/table-of-contents-list';
import { TableOfContentsPanelViewModel } from '../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';

export interface TableOfContentsPanelProps {
  className?: string;
  dataState: FetchingDataState;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = props => (
  <div className={classNames(styles.tableOfContentsPanel, props.className)}>
    {props.dataState}
    <TableOfContentsList tree={props.viewModel.tree} />
  </div>
);

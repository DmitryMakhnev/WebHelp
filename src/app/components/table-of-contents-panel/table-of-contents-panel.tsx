import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './table-of-contents-panel.scss';
import { TableOfContentsList } from '../table-of-contents-list/table-of-contents-list';

export interface TableOfContentsPanelProps {
  className?: string;
  dataState: FetchingDataState;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = props => (
  <div className={classNames(styles.tableOfContentsPanel, props.className)}>
    {props.dataState}
    <TableOfContentsList />
  </div>
);

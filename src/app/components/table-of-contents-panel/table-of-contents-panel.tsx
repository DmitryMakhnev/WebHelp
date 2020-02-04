import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-panel.scss';
import { TableOfContentsList } from '../table-of-contents-list/table-of-contents-list';
import { TableOfContentsPanelViewModel } from '../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';
import { TableOfContentsFilter } from '../table-of-contents-filter/table-of-contents-filter';

export interface TableOfContentsPanelProps {
  className?: string;
  dataState: FetchingDataState;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = observer(props => {
  const tree = props.viewModel.tree;
  const tree2 = props.viewModel.tree2;
  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>
      <div className={styles.top}>
        {props.dataState}
        <TableOfContentsFilter tree={tree2} />
        {tree.currentAnchors.list.map(anchor => (
          <div key={anchor.id}>{anchor.title}</div>
        ))}
        <hr />
      </div>
      <TableOfContentsList className={styles.list} viewModel={props.viewModel} />
    </div>
  );
});

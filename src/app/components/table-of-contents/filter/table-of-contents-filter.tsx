import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-filter.scss';
import { TableOfContentsTree } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';

export const TableOfContentsFilter: FC<{
  className?: string;
  tree: TableOfContentsTree;
}> = observer(props => {
  const tree = props.tree;

  return (
    <div className={classNames(styles.tableOfContentsFilter)}>
      <input
        type="text"
        value={props.tree.textQuery || ''}
        onChange={e => tree.filter(e.target.value)}
      />
    </div>
  );
});

import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-list.scss';
import { TableOfContentsTree } from '../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';
import { TableOfContentsSublist } from '../table-of-contents-sublest/table-of-contents-sublist';

export const TableOfContentsList: FC<{
  className?: string;
  tree: TableOfContentsTree;
}> = observer(props => (
  <div className={classNames(styles.tableOfContentsList, props.className)}>
    { props.tree.children.map(node => <TableOfContentsSublist node={node} key={node.page.id} />) }
  </div>
));

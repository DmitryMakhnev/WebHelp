import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-sublist.scss';
import { TableOfContentsTreeNode } from '../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree-node';
import { jsxIf } from '../../../lib/jsx/jsx-if';


export interface TableOfContentsSublistProps {
  className?: string;
  node: TableOfContentsTreeNode,
}

export const TableOfContentsSublist: FC<TableOfContentsSublistProps> = observer(props => {
  console.log('TableOfContentsSublist rendering');
  const node = props.node;

  return (
    <div className={classNames(styles.tableOfContentsSublist, props.className)}>
      <div
        className={classNames({
          [styles.selected]: node.isSelected,
          [styles.selectedParent]: node.isParentOfSelected,
        })}
      >
        <button type="button" onClick={node.select}>{node.page.title}</button>
        { jsxIf(
          node.isAbleToBeToggled,
          <button type="button" onClick={node.toggle}>toggle</button>,
        ) }
      </div>
      { jsxIf(
        node.isContendBuilt,
        node.children.map(
          childNode => (
            <TableOfContentsSublist
              node={childNode}
              key={childNode.page.id}
              className={styles.innerSublist}
            />
          ),
        ),
      ) }
    </div>
  );
});

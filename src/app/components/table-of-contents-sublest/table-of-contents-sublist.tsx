import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-sublist.scss';
import { TableOfContentsTreeNode } from '../../higher-order-components/table-of-contents-panel/view-model/tree/create-table-of-contents-tree-node';
import { jsxIf } from '../../../lib/jsx/jsx-if';


export interface TableOfContentsSublistProps {
  className?: string;
  node: TableOfContentsTreeNode,
}

export const TableOfContentsSublist: FC<TableOfContentsSublistProps> = observer(props => {
  const node = props.node;

  return (
    <div className={classNames(styles.tableOfContentsSublist, props.className)}>
      <div>
        {node.page.title}
        { jsxIf(
          node.isHasContent,
          <button type="button" onClick={node.toggle}>toggle</button>,
        ) }
      </div>
      { jsxIf(
        node.isContendShowed,
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

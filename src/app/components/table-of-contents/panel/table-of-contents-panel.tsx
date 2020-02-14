import React, { FC, useCallback } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-panel.scss';
import { ChunkedRenderList } from '../../chunked-render-list/chunked-render-list';
import { TableOfContentsPanelViewModel } from '../../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';
import { TableOfContentsFilter } from '../filter/table-of-contents-filter';
import { ITEM_ID_ATTRIBUTE, TableOfContentsListItem } from '../item/table-of-contents-item';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';
import { TableOfContentsTree } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';
import { TableOfContentsChildrenModificationRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/children-representation/table-of-contents-children-modification-representation';

export interface TableOfContentsPanelProps {
  className?: string;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = observer(props => {
  const viewModel = props.viewModel;

  const tree = viewModel.tree;

  const treeCallbacksDeps = [tree];

  const selectPage = useCallback(
    (representation: TableOfContentsPageViewRepresentation) => {
      (tree as TableOfContentsTree).selectPage(representation.id, true);
    },
    treeCallbacksDeps,
  );

  const renderItem = useCallback(
    (
      representation: TableOfContentsPageViewRepresentation,
    ) => {
      // it's alis to tree for using after null checking which ts dont understand
      const notNullTree = tree as TableOfContentsTree;
      return (
        <TableOfContentsListItem
          key={representation.id}
          pageViewRepresentation={representation}
          showSubPages={notNullTree.showSubPages}
          toggleSubPages={notNullTree.toggleSubPages}
          selectPage={selectPage}
          selectAnchor={notNullTree.selectAnchor}
        />
      );
    },
    treeCallbacksDeps,
  );

  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>
      {tree != null && (
        <>
          <div className={styles.top}>
            <TableOfContentsFilter className={styles.filters} tree={tree} />
          </div>
          {tree.hasChildrenForDisplaying
            ? (
              <ChunkedRenderList<
                  TableOfContentsPageViewRepresentation,
                  TableOfContentsChildrenModificationRepresentation
                >
                className={styles.list}
                childrenRepresentationHolder={tree}
                chunkSize={40}
                renderItem={renderItem}
                itemIdAttribute={ITEM_ID_ATTRIBUTE}
              />
            )
            : (
              <div>Empty</div>
            )}
        </>
      )}
    </div>
  );
});

import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-panel.scss';
import { ChunkedRenderList } from '../chunked-render-list/chunked-render-list';
import { TableOfContentsPanelViewModel } from '../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';
import { TableOfContentsFilter } from '../table-of-contents-filter/table-of-contents-filter';
import { jsxIf } from '../../../lib/jsx/jsx-if';
import { ITEM_ID_ATTRIBUTE, TableOfContentsListItem } from '../table-of-contents-list/item/table-of-contents-item';
import { TableOfContentsPageViewRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';
import { TableOfContentsTree } from '../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';
import { TableOfContentsChildrenModificationRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree/children-representation/table-of-contents-children-modification-representation';

export interface TableOfContentsPanelProps {
  className?: string;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = observer(props => {
  const viewModel = props.viewModel;
  const tree = viewModel.tree;

  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>
      <div className={styles.top}>
        {viewModel.treeDataLoadingState}
        {jsxIf(tree != null, () => (
          <>
            <TableOfContentsFilter tree={tree as TableOfContentsTree} />
            <hr />
          </>
        ))}
      </div>

      {jsxIf(tree != null, () => (
        <ChunkedRenderList<
          TableOfContentsPageViewRepresentation,
          TableOfContentsChildrenModificationRepresentation
        >
          className={styles.list}
          childrenRepresentationHolder={tree as TableOfContentsTree}
          renderItem={representation => (
            <TableOfContentsListItem
              key={representation.id}
              pageViewRepresentation={representation}
              toggleSubPages={() => (tree as TableOfContentsTree).toggleSubPages(representation)}
              selectPage={() => (tree as TableOfContentsTree).selectPage(representation.id)}
            />
          )}
          itemIdAttribute={ITEM_ID_ATTRIBUTE}
        />
      ))}
    </div>
  );
});

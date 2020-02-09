import React, { FC } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './table-of-contents-panel.scss';
import { ChunkedRenderList } from '../chunked-render-list/chunked-render-list';
import { TableOfContentsPanelViewModel } from '../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';
import { TableOfContentsFilter } from '../table-of-contents-filter/table-of-contents-filter';
import { jsxIf } from '../../../lib/jsx/jsx-if';
import { TableOfContentsListItem } from '../table-of-contents-list/item/table-of-contents-item';
import { TableOfContentsPageViewRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/table-of-contents-page-view-representation';
import { TableOfContentsTree2 } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/table-of-contents-tree-2';
import { TableOfContentsChildrenModificationRepresentation } from '../../higher-order-components/table-of-contents-panel/view-model/tree-2/children-representation/table-of-contents-children-modification-representation';

export interface TableOfContentsPanelProps {
  className?: string;
  dataState: FetchingDataState;
  viewModel: TableOfContentsPanelViewModel;
}

export const TableOfContentsPanel: FC<TableOfContentsPanelProps> = observer(props => {
  const viewModel = props.viewModel;
  const tree = viewModel.tree;
  const tree2 = viewModel.tree2;

  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>
      <div className={styles.top}>
        {props.dataState}
        {jsxIf(tree2 != null, () => (
          <>
            <TableOfContentsFilter tree={tree2 as TableOfContentsTree2} />
            {tree.currentAnchors.list.map(anchor => (
              <div key={anchor.id}>{anchor.title}</div>
            ))}
            <hr />
          </>
        ))}
      </div>

      {jsxIf(tree2 != null, () => (
        <ChunkedRenderList<
          TableOfContentsPageViewRepresentation,
          TableOfContentsChildrenModificationRepresentation
        >
          className={styles.list}
          childrenRepresentationHolder={tree2 as TableOfContentsTree2}
          renderItem={representation => (
            <TableOfContentsListItem
              pageViewRepresentation={representation}
              toggleSubPages={() => (tree2 as TableOfContentsTree2).toggleSubPages(representation)}
              key={representation.id}
            />
          )}
        />
      ))}
    </div>
  );
});

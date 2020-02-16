import React, { FC, useCallback } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TableOfContentsPanelViewModel } from '../../../higher-order-components/table-of-contents-panel/view-model/table-of-contents-panel.view-model';
import { TableOfContentsFilter } from '../filter/table-of-contents-filter';
import { ITEM_ID_ATTRIBUTE, TableOfContentsListItem } from '../item/table-of-contents-item';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';
import { TableOfContentsTree } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';
import { TableOfContentsChildrenModificationRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/children-representation/table-of-contents-children-modification-representation';
import { ListLoadingStub } from '../../stubs/loading/list/list-loading-stub';
import { ErrorMessage } from '../../meaages/error/error-message';
import { InfoMessage } from '../../meaages/info/info-message';
import { TextActionWithLoader } from '../../actions/text-with-loader/text-action-with-loader';
import { ChunkedList } from '../../chunked-list/chunked-list';
import styles from './table-of-contents-panel.scss';

export interface TableOfContentsPanelProps {
  className?: string;
  viewModel: TableOfContentsPanelViewModel;
  retryToLoadingData: () => void;
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

  const treeDataLoadingState = viewModel.treeDataLoadingState;

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

  const intl = useIntl();
  const retryLoadingText = intl.formatMessage({
    id: 'tableOfContents.retryLoadingAction',
    defaultMessage: 'Retry',
  });

  return (
    <div className={classNames(styles.tableOfContentsPanel, props.className)}>

      {treeDataLoadingState.isLoading && (
        <ListLoadingStub className={styles.loadingStub} />
      )}

      {treeDataLoadingState.hasFailureDuringLoading && (
        <ErrorMessage
          className={styles.message}
          actions={(
            <TextActionWithLoader
              showLoader={treeDataLoadingState.isLoadingAfterFailure}
              ariaLabel={retryLoadingText}
              on={props.retryToLoadingData}
            >
              {retryLoadingText}
            </TextActionWithLoader>
          )}
        >
          <FormattedMessage
            id="tableOfContents.loadingErrorMessage"
            defaultMessage="Something go wrong. Please try later"
          />
        </ErrorMessage>
      )}

      {treeDataLoadingState.hasData && tree != null && (
        <>
          <div className={styles.top}>
            <TableOfContentsFilter className={styles.filters} tree={tree} />
          </div>
          {tree.hasChildrenForDisplaying
            ? (
              <ChunkedList<
                  TableOfContentsPageViewRepresentation,
                  TableOfContentsChildrenModificationRepresentation
                >
                className={styles.list}
                listModificationHolder={tree}
                chunkSize={40}
                renderItem={renderItem}
                itemIdAttribute={ITEM_ID_ATTRIBUTE}
              />
            )
            : (
              <InfoMessage className={styles.message}>
                <FormattedMessage
                  id="tableOfContents.noItemsFound"
                  defaultMessage="No items found"
                />
              </InfoMessage>
            )}
        </>
      )}
    </div>
  );
});

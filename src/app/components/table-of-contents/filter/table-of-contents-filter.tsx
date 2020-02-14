import React, { ChangeEvent, FC, useCallback } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useIntl } from 'react-intl';
import { TableOfContentsTree } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-tree';
import { TextInput } from '../../forms/input/text/text-input';
import styles from './table-of-contents-filter.scss';
import { MiniLoaderIcon } from '../../icons/loaders/mini/mini-loader-icon';

export const TableOfContentsFilter: FC<{
  className?: string;
  tree: TableOfContentsTree;
}> = observer(props => {
  const tree = props.tree;

  const intl = useIntl();
  const filterByText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => tree.filterWithDebouncing(e.target.value),
    [tree],
  );

  return (
    <div className={classNames(styles.root, props.className)}>
      <TextInput
        className={styles.input}
        onChange={filterByText}
        value={tree.displayingTextQuery}
        placeholder={intl.formatMessage({
          id: 'tableOfContents.searchLabel',
          defaultMessage: 'Filter by text',
        })}
        icons={tree.isWaitingFilters ? <MiniLoaderIcon /> : null}
      />
    </div>
  );
});

import React, { FC } from 'react';
import styles from './table-of-contents-item.scss';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree-2/table-of-contents-page-view-representation';

interface SimpleNodeProps {
  pageViewRepresentation: TableOfContentsPageViewRepresentation;
}

const noop = () => {};

export const TableOfContentsListItem: FC<SimpleNodeProps> = props => {
  const pageViewRepresentation = props.pageViewRepresentation;
  const page = pageViewRepresentation.page;
  return (
    <div className={styles.item} data-level={page.level}>
      <button type="button" onClick={noop}>
        {page.title}
      </button>
      {pageViewRepresentation.hasChildren ? (
        <button type="button" onClick={noop}>
          toggle
        </button>
      ) : null}
    </div>
  );
};

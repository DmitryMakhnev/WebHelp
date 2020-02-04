import React, { FC } from 'react';
import styles from './table-of-contents-item.scss';

interface SimpleNodeProps {
  page: TableOfContentsPage;
}

const noop = () => {};

export const TableOfContentsListItem: FC<SimpleNodeProps> = props => {
  const page = props.page;
  return (
    <div className={styles.item} data-level={page.level}>
      <button type="button" onClick={noop}>
        {page.title}
      </button>
      {page.pages ? (
        <button type="button" onClick={noop}>
          toggle
        </button>
      ) : null}
    </div>
  );
};

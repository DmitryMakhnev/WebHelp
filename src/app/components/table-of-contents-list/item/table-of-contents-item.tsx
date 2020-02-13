import React, { FC } from 'react';
import { observer } from 'mobx-react';
import styles from './table-of-contents-item.scss';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';

// if you would like to change it please sync with attribute in component
export const ITEM_ID_ATTRIBUTE = 'data-item-id';

interface SimpleNodeProps {
  pageViewRepresentation: TableOfContentsPageViewRepresentation;
  toggleSubPages: () => void;
  selectPage: () => void;
}

export const TableOfContentsListItem: FC<SimpleNodeProps> = observer(props => {
  const pageViewRepresentation = props.pageViewRepresentation;
  const page = pageViewRepresentation.page;
  return (
    <div className={styles.item} data-level={page.level} data-item-id={pageViewRepresentation.id}>
      <button type="button" onClick={props.selectPage}>
        {page.title}
      </button>
      {pageViewRepresentation.hasChildren ? (
        <button type="button" onClick={props.toggleSubPages}>
          toggle
        </button>
      ) : null}
    </div>
  );
});

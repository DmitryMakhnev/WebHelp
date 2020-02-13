import React, { FC } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './table-of-contents-item.scss';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';
import { jsxIf } from '../../../../lib/jsx/jsx-if';

// if you would like to change it please sync with attribute in component
export const ITEM_ID_ATTRIBUTE = 'data-item-id';

interface TableOfContentsListItemProps {
  pageViewRepresentation: TableOfContentsPageViewRepresentation;
  toggleSubPages: () => void;
  selectPage: () => void;
}

export const TableOfContentsListItem: FC<TableOfContentsListItemProps> = observer(props => {
  const pageViewRepresentation = props.pageViewRepresentation;
  const page = pageViewRepresentation.page;
  return (
    <div
      className={classNames(
        styles.item,
        pageViewRepresentation.isSelected ? styles.selectedItem : '',
      )}
      data-level={page.level}
      data-item-id={pageViewRepresentation.id}
    >
      <div className={styles.main}>
        <button type="button" onClick={props.selectPage}>
          {page.title}
        </button>
        {pageViewRepresentation.hasChildren ? (
          <button type="button" onClick={props.toggleSubPages}>
            toggle
          </button>
        ) : null}
      </div>
      { jsxIf(
        pageViewRepresentation.isSelected && pageViewRepresentation.anchors != null,
        () => (
          <div className={styles.anchors}>
            { (pageViewRepresentation.anchors as TableOfContentsAnchor[]).map(
              anchor => (
                <div key={anchor.id} className={styles.anchor}>
                  { anchor.title }
                </div>
              ),
            ) }
          </div>
        ),
      )}
    </div>
  );
});

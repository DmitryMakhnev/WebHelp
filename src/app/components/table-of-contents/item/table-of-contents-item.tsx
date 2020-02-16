import React, { FC, useCallback, MouseEvent, useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { TableOfContentsPageViewRepresentation } from '../../../higher-order-components/table-of-contents-panel/view-model/tree/table-of-contents-page-view-representation';
import { TableOfContentsAnchors } from '../anchors/table-of-contents-anchors';
import { ArrowIcon } from '../../icons/arrow/arrow-iocn';
import { Action } from '../../actions/base/action';
import styles from './table-of-contents-item.scss';

// if you would like to change it please sync with attribute in component
export const ITEM_ID_ATTRIBUTE = 'data-item-id';

interface TableOfContentsListItemProps {
  className?: string,
  pageViewRepresentation: TableOfContentsPageViewRepresentation;
  showSubPages: (representation: TableOfContentsPageViewRepresentation) => void;
  toggleSubPages: (representation: TableOfContentsPageViewRepresentation) => void;
  selectPage: (representation: TableOfContentsPageViewRepresentation) => void;
  selectAnchor: (anchorId: TableOfContentsAnchorId) => void;
}

export const TableOfContentsListItem: FC<TableOfContentsListItemProps> = observer(props => {
  const pageViewRepresentation = props.pageViewRepresentation;
  const page = pageViewRepresentation.page;
  const pageLevel = page.level;
  const isSubPagesShowed = pageViewRepresentation.isSubPagesShowed;
  const representationCallbacksDeps = [pageViewRepresentation];

  const intel = useIntl();

  const rootRef = useRef<HTMLDivElement>(null);
  const shouldHaveContentAnimations = pageViewRepresentation.shouldHaveContentAnimations;
  const shouldHaveSelectionAnimations = pageViewRepresentation.shouldHaveSelectionAnimations;

  const onItemTextClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      props.selectPage(pageViewRepresentation);
      props.showSubPages(pageViewRepresentation);
    },
    representationCallbacksDeps,
  );

  const onToggleClick = useCallback(
    () => {
      props.toggleSubPages(pageViewRepresentation);
    },
    representationCallbacksDeps,
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root) {
      // we run animation manually and with dirty hacks
      // because we must control them after list chunks were rebuilt
      let shouldWeRunAnimation = false;

      // also we check which animation we should use
      if (shouldHaveContentAnimations) {
        root.classList.add(styles.prepareToContentAnimation);
        shouldWeRunAnimation = true;
      }
      if (shouldHaveSelectionAnimations) {
        root.classList.add(styles.prepareToSelectionAnimation);
        shouldWeRunAnimation = true;
      }

      if (shouldWeRunAnimation) {
        requestAnimationFrame(() => {
          root.classList.add(styles.animate);
        });
      }
    }
  });

  const onMainTransitionEnd = useCallback(() => {
    const root = rootRef.current;
    if (root) {
      root.classList.remove(
        styles.prepareToContentAnimation,
        styles.prepareToSelectionAnimation,
        styles.animate,
      );
    }
  }, representationCallbacksDeps);

  return (
    <div
      className={classNames(
        styles.root,
        props.className,
        pageViewRepresentation.isSelected ? styles.selectedItem : undefined,
      )}
      data-item-id={pageViewRepresentation.id}
      data-page-level={pageLevel}
      ref={rootRef}
    >
      <div className={styles.main} onTransitionEnd={onMainTransitionEnd}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a href="#" className={styles.mainLink} onClick={onItemTextClick}>
          {page.title}
        </a>

        {pageViewRepresentation.hasChildren && (
          <Action
            className={styles.toggleAction}
            on={onToggleClick}
            ariaLabel={intel.formatMessage(
              isSubPagesShowed
                ? {
                  id: 'tableOfContents.hideSubPages',
                  defaultMessage: 'Hide pages',
                }
                : {
                  id: 'tableOfContents.showSubPages',
                  defaultMessage: 'Show pages',
                },
            )}
          >
            <ArrowIcon
              className={classNames(
                styles.arrowIcon,
                isSubPagesShowed ? styles.subPagesShowed : undefined,
              )}
            />
          </Action>
        )}
      </div>
      { pageViewRepresentation.isSelected && pageViewRepresentation.anchors != null && (
        <TableOfContentsAnchors
          shouldHaveAnimation={shouldHaveSelectionAnimations}
          selectAnchor={props.selectAnchor}
          anchors={pageViewRepresentation.anchors as TableOfContentsAnchor[]}
          pageLevel={pageLevel}
        />
      )}
    </div>
  );
});

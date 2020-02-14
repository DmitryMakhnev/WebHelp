import React, { FC, useCallback, useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './table-of-contents-anchors.scss';

interface TableOfContentsAnchorsProps {
  className?: string;
  pageLevel: number;
  anchors: TableOfContentsAnchor[];
  selectAnchor: (anchorId: TableOfContentsAnchorId) => void;
  shouldHaveAnimation: boolean;
}

export const TableOfContentsAnchors: FC<TableOfContentsAnchorsProps> = props => {
  const anchors = props.anchors;

  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;

    // we run animation manually and with dirty hacks
    // because we must control them after list chunks were rebuilt
    if (root && props.shouldHaveAnimation) {
      root.classList.add(styles.prepareAnchorAnimation);
      requestAnimationFrame(() => {
        root.classList.add(styles.animate);
      });
    }
  });
  const transitionEnd = useCallback(() => {
    const root = rootRef.current;
    if (root) {
      root.classList.remove(styles.prepareAnchorAnimation, styles.animate);
    }
  }, []);

  return (
    <div
      className={classNames(styles.anchors, props.className)}
      ref={rootRef}
      onTransitionEnd={transitionEnd}
    >
      { (anchors as TableOfContentsAnchor[]).map(
        anchor => (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            href="#"
            key={anchor.id}
            className={styles.anchor}
            data-page-level={props.pageLevel}
            onClick={e => {
              e.preventDefault();
              props.selectAnchor(anchor.id);
            }}
          >
            { anchor.title }
          </a>
        ),
      ) }
    </div>
  );
};

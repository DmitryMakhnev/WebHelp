import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import styles from './chunked-list-build-in-animated-sub-part.scss';
import { ChunkedRenderListItem } from '../../chunked-render-list-item';

interface ChunkedListBuildInAnimatedSubPartProps<IT extends ChunkedRenderListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
  onAnimationEnd: () => void;
}

export function ChunkedListBuildInAnimatedSubPart<IT extends ChunkedRenderListItem>(
  props: ChunkedListBuildInAnimatedSubPartProps<IT>,
): ReactElement {
  const rootRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current as HTMLDivElement|null;
    const inner = innerRef.current as HTMLDivElement|null;
    if (root && inner) {
      const contentHeight = inner.offsetHeight;
      // we use requestAnimationFrame because before we get offsetHeight
      // and it triggered `Update Layer Tree` (https://gist.github.com/paulirish/5d52fb081b3570c81e3a#box-metrics)
      requestAnimationFrame(() => {
        root.addEventListener(
          'transitionend',
          // we dont care about result height because it
          props.onAnimationEnd,
        );
        root.style.height = `${contentHeight}px`;
      });
    }
  });

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.inner} ref={innerRef}>
        { props.items.map(item => props.renderItem(item)) }
      </div>
    </div>
  );
}

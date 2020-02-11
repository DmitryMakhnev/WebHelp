import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import styles from './chunked-list-build-out-animated-sub-part.scss';
import { ChunkedRenderListItem } from '../../chunked-render-list-item';

interface ChunkedListBuildOutAnimatedSubPartProps<IT extends ChunkedRenderListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
  onAnimationEnd: () => void;
}

export function ChunkedListBuildOutAnimatedSubPart<IT extends ChunkedRenderListItem>(
  props: ChunkedListBuildOutAnimatedSubPartProps<IT>,
) : ReactElement {
  const rootRef = useRef<HTMLDivElement|null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root) {
      const rootHeight = root.offsetHeight;
      root.style.height = `${rootHeight}px`;
      // we use requestAnimationFrame because before we get offsetHeight
      // and it triggered `Update Layer Tree` (https://gist.github.com/paulirish/5d52fb081b3570c81e3a#box-metrics)
      requestAnimationFrame(() => {
        root.addEventListener(
          'transitionend',
          // we dont care about result height because it
          props.onAnimationEnd,
        );
        root.style.height = '0';
      });
    }
  });

  return (
    <div className={styles.root} ref={rootRef}>
      { props.items.map(item => props.renderItem(item)) }
    </div>
  );
}

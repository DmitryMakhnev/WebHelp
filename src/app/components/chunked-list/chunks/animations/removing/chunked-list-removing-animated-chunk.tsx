import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import styles from './chunked-list-removing-animated-chunk.scss';
import { ChunkedListItem } from '../../../types/chunked-list-item';

interface ChunkedListRemovingAnimatedChunkProps<IT extends ChunkedListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
  onAnimationEnd: () => void;
}

export function ChunkedListRemovingAnimatedChunk<IT extends ChunkedListItem>(
  props: ChunkedListRemovingAnimatedChunkProps<IT>,
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
        // it isn't critical to not remove event listener in this case
        // browsers are smart to remove this after dom node was removed
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

import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import styles from './chunked-list-appending-animated-chunk.scss';
import { ChunkedListItem } from '../../../types/chunked-list-item';

interface ChunkedListAppendingAnimatedChunkProps<IT extends ChunkedListItem> {
  items: IT[];
  renderItem: (item: IT) => ReactElement | null;
  onAnimationEnd: () => void;
}

export function ChunkedListAppendingAnimatedChunk<IT extends ChunkedListItem>(
  props: ChunkedListAppendingAnimatedChunkProps<IT>,
): ReactElement {
  const rootRef = useRef<HTMLDivElement|null>(null);
  const innerRef = useRef<HTMLDivElement|null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (root && inner) {
      const contentHeight = inner.offsetHeight;
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

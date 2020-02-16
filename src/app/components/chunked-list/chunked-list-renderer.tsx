import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChunkedListItem } from './types/chunked-list-item';
import { ChunkedListItemsModification } from './types/chunked-list-items-modification';
import { ChunkedRenderListItemsChunkModel } from './chunks/chunked-render-list-items-chunk-model';
import { ChunkedListAppendingAnimatedChunk } from './chunks/animations/appending/chunked-list-appending-animated-chunk';
import { ChunkedListRemovingAnimatedChunk } from './chunks/animations/removing/chunked-list-removing-animated-chunk';
import { ChunkedListItemsChunk } from './chunks/chunked-list-items-chunk';
import styles from './chunked-list-renderer.scss';

interface ChunkedListRendererProps<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
> {
  className?: string;
  renderItem: (representation: IT) => ReactElement | null;
  chunks: ChunkedRenderListItemsChunkModel<IT>[];
  scrollListener: () => void;
  setScrollContainer: (scrollContainer: HTMLDivElement) => void;
  setInnerContainer: (innerContainer: HTMLDivElement) => void;
  appendingChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;
  onAppendingAnimationEnd: () => void;
  removingChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;
  onRemovingOutAnimationEnd: () => void;
}

export function ChunkedListRenderer<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
>(
  props: ChunkedListRendererProps<IT, MT>,
) {
  const renderItem = props.renderItem;

  return (
    <div
      className={classNames(styles.root, props.className)}
      ref={props.setScrollContainer}
      onScroll={props.scrollListener}
    >
      <div className={styles.inner} ref={props.setInnerContainer}>
        {props.chunks.map(chunk => {
          if (chunk === props.appendingChunk) {
            return (
              <ChunkedListAppendingAnimatedChunk
                items={chunk.items}
                key={`${chunk.id}_appending-animated`}
                renderItem={renderItem}
                onAnimationEnd={props.onAppendingAnimationEnd}
              />
            );
            // eslint-disable-next-line no-else-return
          } else if (chunk === props.removingChunk) {
            return (
              <ChunkedListRemovingAnimatedChunk
                items={chunk.items}
                key={`${chunk.id}_removing-animated`}
                renderItem={renderItem}
                onAnimationEnd={props.onRemovingOutAnimationEnd}
              />
            );
          }
          return (
            <ChunkedListItemsChunk
              items={chunk.items}
              key={chunk.id}
              renderItem={renderItem}
            />
          );
        })}
      </div>
    </div>
  );
}

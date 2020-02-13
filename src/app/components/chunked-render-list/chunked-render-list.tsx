import React, { Component, ReactElement } from 'react';
import classNames from 'classnames';
import { reaction } from 'mobx';
import styles from './chunked-render-list.scss';
import { ChunkedRenderListItem } from './chunked-render-list-item';
import { ChunkedRenderListItemsChunkModel } from './chunks/chunked-render-list-items-chunk-model';
import { ChunkedRenderListItemsChunk } from './chunks/chunked-render-list-items-chunk';
import { ChunkedRenderListItemsModification } from './chunked-render-list-items-modification';
import { ChunkedRenderListModificationHolder } from './chunked-render-list-modification-holder';
import { buildChunksForFullRerender } from './chunks/build-chunks-for-full-rerender';
import { ChunkedRenderListItemsChunksBuildResult } from './chunks/chunked-render-list-items-chunks-build-result';
import { buildChunksForAppendRender } from './chunks/build-chunks-for-append-render';
import { createChunkId } from './chunks/chunk-id-factory';
import { ChunkedListBuildInAnimatedSubPart } from './animations/build-in-animated-sub-part/chunked-list-build-in-animated-sub-part';
import { buildChunksForRemovedRerender } from './chunks/build-chunks-for-removed-render';
import { ChunkedListBuildOutAnimatedSubPart } from './animations/build-out-animated-sub-part/chunked-list-build-out-animated-sub-part';

const DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING = 100;
const DEFAULT_LIST_ITEMS_CHUNK_SIZE = 10;

function noop() {}

function putChunkAfterChunkWithItemWithId<IT extends ChunkedRenderListItem>(
  chunks: ChunkedRenderListItemsChunkModel<IT>[],
  chunk: ChunkedRenderListItemsChunkModel<IT>,
  itemId: string,
) {
  const findChunkWithItemIndex = chunks.findIndex(
    chunkFromChunks => chunkFromChunks.itemIndexesById.has(itemId),
  );
  return chunks.slice(0, findChunkWithItemIndex + 1)
    .concat(
      chunk,
      chunks.slice(findChunkWithItemIndex + 1),
    );
}

function removeChunkFromChunks<IT extends ChunkedRenderListItem>(
  chunks: ChunkedRenderListItemsChunkModel<IT>[],
  chunk: ChunkedRenderListItemsChunkModel<IT>,
): ChunkedRenderListItemsChunkModel<IT>[] {
  return chunks.filter(
    chunkFromChunks => chunkFromChunks !== chunk,
  );
}

interface ChunkedRenderListProps<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
> {
  className?: string;
  childrenRepresentationHolder: ChunkedRenderListModificationHolder<IT, MT>;
  renderItem: (representation: IT) => ReactElement | null;
  chunkSize?: number;
  gapBeforeScrollEndChecking?: number;
}

interface ChunkedRenderListState<T extends ChunkedRenderListItem> {
  chunks: ChunkedRenderListItemsChunkModel<T>[];
}

export class ChunkedRenderList<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
> extends Component<ChunkedRenderListProps<IT, MT>, ChunkedRenderListState<IT>> {
  private storedChunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  private allAppendChunks: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

  private buildInChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringAppendingAnimation = false;

  private buildOutChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringRemovingAnimation = false;

  private scrollContainer: HTMLDivElement|undefined;

  private innerContainer: HTMLDivElement|undefined;

  private scheduledRenderTryingOperation = -1;

  private resolvedChunkSize: number;

  private resolvedGapBeforeScrollEndChecking: number;

  private allRequiredChunksWasRendered = true;

  private nextRepresentationForRender: MT|undefined;

  constructor(props: ChunkedRenderListProps<IT, MT>) {
    super(props);
    this.resolvedChunkSize = props.chunkSize || DEFAULT_LIST_ITEMS_CHUNK_SIZE;
    this.resolvedGapBeforeScrollEndChecking = props.gapBeforeScrollEndChecking
      || DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING;
    this.state = {
      chunks: [],
    };
  }

  componentDidMount(): void {
    const childrenRepresentationHolder = this.props.childrenRepresentationHolder;
    // TODO [dmitry.makhnev]: think about doing it without MobX
    reaction(
      () => childrenRepresentationHolder.childrenModification,
      childrenRepresentation => {
        this.stopAllAnimation();
        // if all required chunks weren't rendered we save next update
        if (!this.allRequiredChunksWasRendered) {
          this.nextRepresentationForRender = childrenRepresentation;
        } else {
          this.rebuildChunks(childrenRepresentation);
        }
      },
    );
    this.rebuildChunks(childrenRepresentationHolder.childrenModification);
  }

  private rebuildChunks(childrenRepresentation: MT) {
    // chunks rebuild
    let chunksBuildingResult: ChunkedRenderListItemsChunksBuildResult<IT>;
    let chunksForRender: ChunkedRenderListItemsChunkModel<IT>[];

    switch (childrenRepresentation.modificationType) {
      case 'CHILDREN_APPENDED':
        chunksBuildingResult = buildChunksForAppendRender(
          createChunkId,
          this.resolvedChunkSize,
          this.state.chunks,
          this.storedChunks,
          childrenRepresentation,
        );
        chunksForRender = chunksBuildingResult.chunksForRender;
        // save extra information
        this.buildInChunk = chunksBuildingResult.mainInteractionChunk;
        if (chunksBuildingResult.allInteractionChunks &&
          chunksBuildingResult.allInteractionChunks.length !== 1
        ) {
          this.allAppendChunks = chunksBuildingResult.allInteractionChunks;
        }
        // start animation
        this.isDuringAppendingAnimation = true;
        break;
      // base case is full rerender
      case 'CHILDREN_REMOVED':
        chunksBuildingResult = buildChunksForRemovedRerender(
          createChunkId,
          this.resolvedChunkSize,
          this.state.chunks,
          this.storedChunks,
          childrenRepresentation,
        );
        // put removing chunk into rendered chunks
        chunksForRender = putChunkAfterChunkWithItemWithId(
          chunksBuildingResult.chunksForRender,
          chunksBuildingResult.mainInteractionChunk as ChunkedRenderListItemsChunkModel<IT>,
          childrenRepresentation.bearingItemId as string,
        );
        this.buildOutChunk = chunksBuildingResult.mainInteractionChunk;
        // start animation
        this.isDuringRemovingAnimation = true;
        break;
      default:
        chunksBuildingResult = buildChunksForFullRerender(
          createChunkId,
          this.resolvedChunkSize,
          childrenRepresentation,
        );
        chunksForRender = chunksBuildingResult.chunksForRender;
        break;
    }

    this.allRequiredChunksWasRendered = false;
    this.storedChunks = chunksBuildingResult.chunks;

    this.renderChunks(chunksForRender);
  }

  private renderChunks(chunks: ChunkedRenderListItemsChunkModel<IT>[]) {
    this.setState(
      {
        chunks,
      },
      this.isDuringAppendingAnimation || this.isDuringRemovingAnimation
        ? noop
        : this.scheduleRequiredNotBuiltChunksChecking,
    );
  }

  // main idea if this method is checking of not rendered chunks for without scroll situation
  // or for holes situations after append
  private tryRenderIfItNeed = () => {
    let nextChunksForRender: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

    // check that all holes after append chunk is filled (appending at first)
    if (this.allAppendChunks) {
      const allAppendChunks = this.allAppendChunks;
      const currentRenderedChunks = this.state.chunks;
      const lastAppendChunks = allAppendChunks.shift();
      const indexOfLastAppendChunk = currentRenderedChunks.findIndex(
        chunk => chunk === lastAppendChunks,
      );
      nextChunksForRender = currentRenderedChunks.slice(0, indexOfLastAppendChunk + 1)
        .concat(
          allAppendChunks[0],
          currentRenderedChunks.slice(indexOfLastAppendChunk + 1, currentRenderedChunks.length),
        );
      // reset allAppendChunks after rendering last of them
      if (allAppendChunks.length === 1) {
        this.allAppendChunks = undefined;
      }

    // check that scroll container is filled for scroll
    } else if (this.scrollContainer && this.innerContainer) {
      const innerHeight = this.innerContainer.offsetHeight;
      const scrollContainerHeight = this.scrollContainer.offsetHeight;
      if (innerHeight - this.resolvedGapBeforeScrollEndChecking < scrollContainerHeight) {
        nextChunksForRender = this.getChunksForNextRender();
      }
    }

    if (nextChunksForRender) {
      this.renderChunks(nextChunksForRender);
    } else {
      this.allRequiredChunksWasRendered = true;
      const nextRepresentationForRender = this.nextRepresentationForRender;
      if (nextRepresentationForRender) {
        this.nextRepresentationForRender = undefined;
        this.rebuildChunks(nextRepresentationForRender);
      }
    }
  };

  // we scheduling required chunks rendering for better performance of UI
  private scheduleRequiredNotBuiltChunksChecking = () => {
    this.cancelScheduledRenderingTrying();
    this.scheduledRenderTryingOperation = requestAnimationFrame(this.tryRenderIfItNeed);
  };

  private cancelScheduledRenderingTrying() {
    cancelAnimationFrame(this.scheduledRenderTryingOperation);
  }

  private stopAllAnimation() {
    // stop animations fro rebuild
    if (this.isDuringAppendingAnimation) {
      this.cleanAppendChunksAnimation();
    }
    if (this.isDuringRemovingAnimation) {
      this.cleanRemovedChunksAnimation();
    }
  }

  private cleanAppendChunksAnimation() {
    this.isDuringAppendingAnimation = false;
    this.buildInChunk = undefined;
  }

  private cleanRemovedChunksAnimation(isForce: boolean = true) {
    this.isDuringRemovingAnimation = false;
    const buildOutChunk = this.buildOutChunk;
    this.buildOutChunk = undefined;
    if (buildOutChunk && isForce) {
      // remove built out chunk from rendered chunks in state
      // I know what I do
      // eslint-disable-next-line react/no-access-state-in-setstate
      const renderedChunksWithout = removeChunkFromChunks(this.state.chunks, buildOutChunk);
      this.setState({
        chunks: renderedChunksWithout,
      });
    }
  }

  private getChunksForNextRender(): ChunkedRenderListItemsChunkModel<IT>[]|undefined {
    const currentStateChunksCount = this.state.chunks.length;
    if (currentStateChunksCount < this.storedChunks.length) {
      const chunks = this.state.chunks;
      return chunks.concat(this.storedChunks[currentStateChunksCount]);
    }
    return undefined;
  }

  private onBuildInAnimationEnd = () => {
    this.cleanAppendChunksAnimation();

    // run force rerender for updating chunks after animation
    this.forceUpdate(this.scheduleRequiredNotBuiltChunksChecking);
  };

  private onBuildOutAnimationEnd = () => {
    this.cleanRemovedChunksAnimation();

    // run force rerender for updating chunks after animation
    this.forceUpdate(this.scheduleRequiredNotBuiltChunksChecking);
  };

  private scrollListener = () => {
    const scrollContainer = this.scrollContainer;
    if (scrollContainer) {
      const scrollContainerHeight = scrollContainer.offsetHeight;
      const innerHeight = scrollContainer.scrollHeight;
      const scrollTop = scrollContainer.scrollTop;
      const currentScrollEndGap = innerHeight - (scrollTop + scrollContainerHeight);
      if (currentScrollEndGap < this.resolvedGapBeforeScrollEndChecking) {
        const nextChunksForRender = this.getChunksForNextRender();
        if (nextChunksForRender) {
          this.renderChunks(nextChunksForRender);
        }
      }
    }
  };

  private setScrollContainer = (scrollContainer: HTMLDivElement) => {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.scrollListener);
    }
    if (scrollContainer) {
      this.scrollContainer = scrollContainer;
      // think about management by react
      // think about `passive` flag
      scrollContainer.addEventListener('scroll', this.scrollListener);
    }
  };

  private setInnerContainer = (innerContainer: HTMLDivElement) => {
    this.innerContainer = innerContainer;
  };

  render() {
    const props = this.props;
    const renderItem = props.renderItem;

    return (
      <div className={classNames(styles.root, props.className)} ref={this.setScrollContainer}>
        <div className={styles.inner} ref={this.setInnerContainer}>
          {this.state.chunks.map(chunk => {
            if (chunk === this.buildInChunk) {
              return (
                <ChunkedListBuildInAnimatedSubPart
                  items={chunk.items}
                  key={`${chunk.id}_build-in-animation`}
                  renderItem={renderItem}
                  onAnimationEnd={this.onBuildInAnimationEnd}
                />
              );
            // eslint-disable-next-line no-else-return
            } else if (chunk === this.buildOutChunk) {
              return (
                <ChunkedListBuildOutAnimatedSubPart
                  items={chunk.items}
                  key={`${chunk.id}_build-out-animation`}
                  renderItem={renderItem}
                  onAnimationEnd={this.onBuildOutAnimationEnd}
                />
              );
            }
            return (
              <ChunkedRenderListItemsChunk<IT>
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
}

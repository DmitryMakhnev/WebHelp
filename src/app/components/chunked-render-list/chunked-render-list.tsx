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
import { chunkIdsFactory } from './chunks/chunk-id-factory';
import { ChunkedListBuildInAnimatedSubPart } from './animations/build-in-animated-sub-part/chunked-list-build-in-animated-sub-part';

const DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING = 100;
const DEFAULT_LIST_ITEMS_CHUNK_SIZE = 50;

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

function noop() {}

export class ChunkedRenderList<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
> extends Component<ChunkedRenderListProps<IT, MT>, ChunkedRenderListState<IT>> {
  private storedChunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  private buildInChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private allAppendChunks: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

  private isDuringInBuildAnimation = false;

  private scrollContainer: HTMLDivElement|undefined;

  private innerContainer: HTMLDivElement|undefined;

  private scheduledRenderTryingOperation = -1;

  private resolvedChunkSize: number;

  private resolvedGapBeforeScrollEndChecking: number;

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
        this.cancelScheduledRenderingTrying();
        this.stopAllAnimation();
        // TODO [dmitry.makhnev]: remember about building in holes
        this.rebuildChunks(childrenRepresentation);
      },
    );
    this.rebuildChunks(childrenRepresentationHolder.childrenModification);
  }

  private rebuildChunks(childrenRepresentation: MT) {
    // chunks rebuild
    let chunksBuildingResult: ChunkedRenderListItemsChunksBuildResult<IT>;

    switch (childrenRepresentation.modificationType) {
      case 'CHILDREN_APPENDED':
        chunksBuildingResult = buildChunksForAppendRender(
          chunkIdsFactory,
          this.resolvedChunkSize,
          this.state.chunks,
          this.storedChunks,
          childrenRepresentation,
        );
        // save extra information
        this.buildInChunk = chunksBuildingResult.mainInteractionChunk;
        if (chunksBuildingResult.allInteractionChunks &&
          chunksBuildingResult.allInteractionChunks.length !== 1
        ) {
          this.allAppendChunks = chunksBuildingResult.allInteractionChunks;
        }
        // start animation
        this.isDuringInBuildAnimation = true;
        break;
      // base case is full rerender
      default:
        chunksBuildingResult = buildChunksForFullRerender(
          chunkIdsFactory,
          this.resolvedChunkSize,
          childrenRepresentation,
        );
        break;
    }

    this.storedChunks = chunksBuildingResult.chunks;

    this.renderChunks(chunksBuildingResult.chunksForRender);
  }

  private renderChunks(chunks: ChunkedRenderListItemsChunkModel<IT>[]) {
    this.setState(
      {
        chunks,
      },
      this.isDuringInBuildAnimation
        ? noop
        : this.scheduleRequiredNotBuiltChunksChecking,
    );
  }

  // main idea if this method is checking of not rendered chunks for without scroll situation
  // or for holes situations (think about it holes)
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
    if (this.isDuringInBuildAnimation) {
      this.isDuringInBuildAnimation = false;
      this.buildInChunk = undefined;
    }

    // TODO [dmitry.makhnev]: think about it
    // it's possible to have holes if next append
    // is run before last append chunks was added completely
    // possible solutions?
    // 1) block opening until drawing all appended chunks (extra painfully)
    // 2) try to understand it in building appending/removing (painfully)
    if (this.allAppendChunks) {
      this.allAppendChunks = undefined;
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

  private onBuildAnimationEnd = () => {
    this.buildInChunk = undefined;
    this.isDuringInBuildAnimation = false;

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
    this.scrollContainer = scrollContainer;
    scrollContainer.addEventListener('scroll', this.scrollListener);
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
          {this.state.chunks.map(chunk => (
            chunk === this.buildInChunk
              ? (
                <ChunkedListBuildInAnimatedSubPart
                  items={chunk.items}
                  key={`${chunk.id}_build-in-animation`}
                  renderItem={renderItem}
                  onAnimationEnd={this.onBuildAnimationEnd}
                />
              )
              : (
                <ChunkedRenderListItemsChunk<IT>
                  items={chunk.items}
                  key={chunk.id}
                  renderItem={renderItem}
                />
              )
          ))}
        </div>
      </div>
    );
  }
}

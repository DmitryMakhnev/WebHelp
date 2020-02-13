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
import { buildChunksForIndependentPartRender } from './chunks/build-chunks-for-independent-part-render';

const DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING = 100;
const DEFAULT_SPACE_BEFORE_SCROLL_CHECKING_GAP = 50;
const DEFAULT_ITEM_ID_ATTRIBUTE = 'data-item-id';
const DEFAULT_GAP_FOR_INTERACTION_ITEM = 50;
const DEFAULT_LIST_ITEMS_CHUNK_SIZE = 50;

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
  itemIdAttribute?: string;
  gapForInteractionItem?: number;
  spaceBeforeScrollCheckingGap?: number;
}

interface ChunkedRenderListState<T extends ChunkedRenderListItem> {
  chunks: ChunkedRenderListItemsChunkModel<T>[];
}

export class ChunkedRenderList<
  IT extends ChunkedRenderListItem,
  MT extends ChunkedRenderListItemsModification<IT>
> extends Component<ChunkedRenderListProps<IT, MT>, ChunkedRenderListState<IT>> {
  private chunkSize: number;

  private gapBeforeScrollEndChecking: number;

  private spaceBeforeScrollCheckingGap: number;

  private itemIdAttribute: string;

  private gapForInteractionItem: number;

  private storedChunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  private allAppendChunks: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

  private buildInChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringAppendingAnimation = false;

  private buildOutChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringRemovingAnimation = false;

  private interactionChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private scrollContainer: HTMLDivElement|undefined;

  private innerContainer: HTMLDivElement|undefined;

  private scheduledRenderTryingOperation = -1;

  private allRequiredChunksWasRendered = true;

  private nextRepresentationForRender: MT|undefined;

  constructor(props: ChunkedRenderListProps<IT, MT>) {
    super(props);

    // resolve settings
    this.chunkSize = props.chunkSize || DEFAULT_LIST_ITEMS_CHUNK_SIZE;
    this.gapBeforeScrollEndChecking = props.gapBeforeScrollEndChecking
      || DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING;
    this.itemIdAttribute = props.itemIdAttribute || DEFAULT_ITEM_ID_ATTRIBUTE;
    this.gapForInteractionItem = props.gapForInteractionItem || DEFAULT_GAP_FOR_INTERACTION_ITEM;
    this.spaceBeforeScrollCheckingGap = props.spaceBeforeScrollCheckingGap
      || DEFAULT_SPACE_BEFORE_SCROLL_CHECKING_GAP;

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
    const resolvedChunkSize = this.chunkSize;

    // chunks rebuild
    let chunksBuildingResult: ChunkedRenderListItemsChunksBuildResult<IT>;
    let chunksForRender: ChunkedRenderListItemsChunkModel<IT>[];

    switch (childrenRepresentation.modificationType) {
      case 'CHILDREN_APPENDED':
        chunksBuildingResult = buildChunksForAppendRender(
          createChunkId,
          resolvedChunkSize,
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
      case 'CHILDREN_REMOVED':
        chunksBuildingResult = buildChunksForRemovedRerender(
          createChunkId,
          this.chunkSize,
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
      case 'ADDING_INDEPENDENT_PART':
      case 'INTERACTION_WITH':
        chunksBuildingResult = buildChunksForIndependentPartRender(
          createChunkId,
          resolvedChunkSize,
          childrenRepresentation,
        );
        // save extra information
        this.interactionChunk = chunksBuildingResult.mainInteractionChunk;
        chunksForRender = chunksBuildingResult.chunksForRender;
        this.resetScrollTopGap();
        break;
      // base case is full rerender
      default:
        chunksBuildingResult = buildChunksForFullRerender(
          createChunkId,
          this.chunkSize,
          childrenRepresentation,
        );
        chunksForRender = chunksBuildingResult.chunksForRender;
        this.resetScrollTopGap(true);
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
    let newChunksForRender: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

    // check that all holes after append chunk is filled (appending at first)
    if (this.allAppendChunks) {
      const allAppendChunks = this.allAppendChunks;
      const currentRenderedChunks = this.state.chunks;
      const lastAppendChunks = allAppendChunks.shift();
      const indexOfLastAppendChunk = currentRenderedChunks.findIndex(
        chunk => chunk === lastAppendChunks,
      );
      newChunksForRender = currentRenderedChunks.slice(0, indexOfLastAppendChunk + 1)
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
      if (innerHeight - this.gapBeforeScrollEndChecking < scrollContainerHeight) {
        // at first try to render chunks before rendered chunks
        newChunksForRender = this.getChunksForRenderBeforeRenderedChunks();
        if (!newChunksForRender) {
          // at second try to render chunks after rendered chunks
          newChunksForRender = this.getChunksForRenderAfterRenderedChunks();
        }
      }
    }

    if (newChunksForRender) {
      this.renderChunks(newChunksForRender);
    } else {
      const nextRepresentationForRender = this.nextRepresentationForRender;
      if (nextRepresentationForRender) {
        this.allRequiredChunksWasRendered = true;
        this.nextRepresentationForRender = undefined;
        this.rebuildChunks(nextRepresentationForRender);
      } else {
        this.fixScrollPositionAfterUpdateRender();
        this.allRequiredChunksWasRendered = true;
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

  private getIndexOfFirstRenderedChunkInChunks() {
    const firstRenderedChunk = this.state.chunks[0];
    return this.storedChunks.findIndex(
      chunk => chunk.id === firstRenderedChunk.id,
    );
  }

  private hasNotRenderedChunksBeforeRenderedChunks() {
    const indexOfFirstRenderedChunksInStoredChunks = this.getIndexOfFirstRenderedChunkInChunks();
    return indexOfFirstRenderedChunksInStoredChunks !== 0;
  }

  private getChunksForRenderBeforeRenderedChunks():
    ChunkedRenderListItemsChunkModel<IT>[]|undefined {
    if (this.hasNotRenderedChunksBeforeRenderedChunks()) {
      const indexOfFirstRenderedChunksInStoredChunks = this.getIndexOfFirstRenderedChunkInChunks();
      if (indexOfFirstRenderedChunksInStoredChunks !== 0) {
        const allChunks = this.storedChunks;
        const currentRenderedChunks = this.state.chunks;
        const prevChunkFromAllChunks = allChunks[indexOfFirstRenderedChunksInStoredChunks - 1];
        if (prevChunkFromAllChunks) {
          return [prevChunkFromAllChunks].concat(currentRenderedChunks);
        }
      }
    }
    return undefined;
  }

  private getChunksForRenderAfterRenderedChunks():
    ChunkedRenderListItemsChunkModel<IT>[]|undefined {
    const currentRenderedChunks = this.state.chunks;
    const lastRenderedChunk = currentRenderedChunks[currentRenderedChunks.length - 1];
    const storedChunks = this.storedChunks;
    const indexOfLastRenderedChunksInStoredChunks = storedChunks.findIndex(
      chunk => chunk.id === lastRenderedChunk.id,
    );
    if (indexOfLastRenderedChunksInStoredChunks < storedChunks.length - 1) {
      return currentRenderedChunks.concat(
        storedChunks[indexOfLastRenderedChunksInStoredChunks + 1],
      );
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

  private resetScrollTopGap(isRestToTop: boolean = false) {
    if (this.innerContainer && this.scrollContainer) {
      this.innerContainer.style.paddingTop = '0';

      const scrollContainer = this.scrollContainer;
      if (isRestToTop) {
        scrollContainer.scrollTop = 0;
      } else {
        const prevScrollTop = scrollContainer.scrollTop;
        scrollContainer.scrollTop = prevScrollTop - this.gapBeforeScrollEndChecking;
      }
    }
  }

  private fixScrollPositionAfterUpdateRender() {
    // fix gap
    if (this.hasNotRenderedChunksBeforeRenderedChunks() && this.innerContainer) {
      this.innerContainer.style.paddingTop = `${DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING}px`;
    }

    // scroll to interaction chunk
    if (this.interactionChunk) {
      const firstRepresentationItemOfChunk = this.interactionChunk.items[0];
      // reset interaction chunk
      this.interactionChunk = undefined;
      if (firstRepresentationItemOfChunk) {
        const itemId = firstRepresentationItemOfChunk.id;
        const itemInDOM = document.querySelector(`[${this.itemIdAttribute}="${itemId}"]`);
        if (itemInDOM) {
          const scrollContainer = this.scrollContainer as HTMLDivElement;
          const scrollBoundingRect = scrollContainer.getBoundingClientRect();
          const itemBoundingRect = itemInDOM.getBoundingClientRect();
          const differenceFromScrollStart = itemBoundingRect.top - scrollBoundingRect.top;
          if (Math.abs(differenceFromScrollStart) > this.gapForInteractionItem) {
            const scrollTop = scrollContainer.scrollTop
              + (differenceFromScrollStart - this.gapForInteractionItem);
            scrollContainer.scrollTop = scrollTop;
          }
        }
      }
    }
  }

  private scrollListener = () => {
    const scrollContainer = this.scrollContainer;
    if (scrollContainer && !this.isDuringAppendingAnimation && !this.isDuringRemovingAnimation) {
      const scrollTop = scrollContainer.scrollTop;
      const isRequiredToCheckChunksBefore = scrollTop <
        (this.gapBeforeScrollEndChecking + this.spaceBeforeScrollCheckingGap);
      if (isRequiredToCheckChunksBefore &&
        this.hasNotRenderedChunksBeforeRenderedChunks()
      ) {
        const nextChunksForRender = this.getChunksForRenderBeforeRenderedChunks();
        if (nextChunksForRender) {
          // if we will render first chunk
          if (nextChunksForRender[0] === this.storedChunks[0]) {
            this.resetScrollTopGap();
          }
          this.renderChunks(nextChunksForRender);
        }
      } else {
        const scrollContainerHeight = scrollContainer.offsetHeight;
        const innerHeight = scrollContainer.scrollHeight;
        const currentScrollEndGap = innerHeight - (scrollTop + scrollContainerHeight);
        if (currentScrollEndGap < this.gapBeforeScrollEndChecking) {
          const nextChunksForRender = this.getChunksForRenderAfterRenderedChunks();
          if (nextChunksForRender) {
            this.renderChunks(nextChunksForRender);
          }
        }
      }
    }
  };

  private setScrollContainer = (scrollContainer: HTMLDivElement) => {
    this.scrollContainer = scrollContainer;
  };

  private setInnerContainer = (innerContainer: HTMLDivElement) => {
    this.innerContainer = innerContainer;
  };

  render() {
    const props = this.props;
    const renderItem = props.renderItem;

    return (
      <div
        className={classNames(styles.root, props.className)}
        ref={this.setScrollContainer}
        onScroll={this.scrollListener}
      >
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
              <ChunkedRenderListItemsChunk
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

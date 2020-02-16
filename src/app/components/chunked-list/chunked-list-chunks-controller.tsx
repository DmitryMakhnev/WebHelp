import React, { Component, ReactElement } from 'react';
import { IReactionDisposer, reaction } from 'mobx';
import { ChunkedListItem } from './types/chunked-list-item';
import { ChunkedRenderListItemsChunkModel } from './chunks/chunked-render-list-items-chunk-model';
import { ChunkedListItemsModification } from './types/chunked-list-items-modification';
import { ChunkedListModificationHolder } from './types/chunked-list-modification-holder';
import { buildChunksForFullRerender } from './chunks/build-chunks-for-full-rerender';
import { ChunkedRenderListItemsChunksBuildResult } from './chunks/chunked-render-list-items-chunks-build-result';
import { buildChunksForAppendRender } from './chunks/build-chunks-for-append-render';
import { createChunkId } from './chunks/create-chunk-id';
import { buildChunksForRemovedRerender } from './chunks/build-chunks-for-removed-render';
import { buildChunksForIndependentPartRender } from './chunks/build-chunks-for-independent-part-render';
import { putChunkAfterChunkWithItemWithId } from './chunks/put-chunk-after-chunk-with-item-with-id';
import { removeChunkFromChunks } from './chunks/remove-chunk-from-chunks';
import { ChunkedListRenderer } from './chunked-list-renderer';

const DEFAULT_GAP_BEFORE_SCROLL_END_CHECKING = 100;
const DEFAULT_SPACE_BEFORE_SCROLL_CHECKING_GAP = 50;
const DEFAULT_ITEM_ID_ATTRIBUTE = 'data-item-id';
const DEFAULT_GAP_FOR_INTERACTION_ITEM = 50;
const DEFAULT_LIST_ITEMS_CHUNK_SIZE = 50;

export interface ChunkedListChunksControllerProps<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
> {
  className?: string;
  listModificationHolder: ChunkedListModificationHolder<IT, MT>;
  renderItem: (representation: IT) => ReactElement | null;
  chunkSize?: number;
  gapBeforeScrollEndChecking?: number;
  itemIdAttribute?: string;
  gapForInteractionItem?: number;
  spaceBeforeScrollCheckingGap?: number;
}

interface ChunkedListChunksControllerState<T extends ChunkedListItem> {
  chunks: ChunkedRenderListItemsChunkModel<T>[];
}

/**
 * @description self controlled component for controlling of displayed chunks of items
 * with supporting animations of appending and removing items
 * */
export class ChunkedListChunksController<
  IT extends ChunkedListItem,
  MT extends ChunkedListItemsModification<IT>
> extends Component<
  ChunkedListChunksControllerProps<IT, MT>,
  ChunkedListChunksControllerState<IT>
> {
  private chunkSize: number;

  private gapBeforeScrollEndChecking: number;

  private spaceBeforeScrollCheckingGap: number;

  private itemIdAttribute: string;

  private gapForInteractionItem: number;

  private storedChunks: ChunkedRenderListItemsChunkModel<IT>[] = [];

  private allAppendChunks: ChunkedRenderListItemsChunkModel<IT>[]|undefined;

  private appendingChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringAppendingAnimation = false;

  private removingChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private isDuringRemovingAnimation = false;

  private interactionChunk: ChunkedRenderListItemsChunkModel<IT>|undefined;

  private scrollContainer: HTMLDivElement|undefined;

  private innerContainer: HTMLDivElement|undefined;

  private scheduledRenderRequestId = -1;

  private allRequiredChunksWasRendered = true;

  private nextChildrenModificationForRender: MT|undefined;

  private childrenModificationReactionDisposer: IReactionDisposer|undefined;

  constructor(props: ChunkedListChunksControllerProps<IT, MT>) {
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
    const childrenRepresentationHolder = this.props.listModificationHolder;
    // for MobX based approach is comfortable to use MobX only
    // If you would like to use this component with not MobX stack
    // please refactor this in this way
    // https://reactjs.org/docs/higher-order-components.html#use-hocs-for-cross-cutting-concerns
    this.childrenModificationReactionDisposer = reaction(
      () => childrenRepresentationHolder.childrenModification,
      childrenModification => {
        this.stopAllAnimation();
        // if all required chunks weren't rendered we save modification for next update
        if (!this.allRequiredChunksWasRendered) {
          this.nextChildrenModificationForRender = childrenModification;
        } else {
          this.rebuildChunks(childrenModification);
        }
      },
    );
    this.rebuildChunks(childrenRepresentationHolder.childrenModification);
  }

  componentWillUnmount(): void {
    if (this.childrenModificationReactionDisposer) {
      this.childrenModificationReactionDisposer();
    }
  }

  private rebuildChunks(childrenModification: MT) {
    const resolvedChunkSize = this.chunkSize;

    // chunks rebuild
    let chunksBuildingResult: ChunkedRenderListItemsChunksBuildResult<IT>;
    let chunksForRender: ChunkedRenderListItemsChunkModel<IT>[];

    switch (childrenModification.modificationType) {
      case 'CHILDREN_APPENDED':
        chunksBuildingResult = buildChunksForAppendRender(
          createChunkId,
          resolvedChunkSize,
          this.state.chunks,
          this.storedChunks,
          childrenModification,
        );
        chunksForRender = chunksBuildingResult.chunksForRender;
        // save extra information
        this.appendingChunk = chunksBuildingResult.mainInteractionChunk;
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
          resolvedChunkSize,
          this.state.chunks,
          this.storedChunks,
          childrenModification,
        );
        // put removing chunk into rendered chunks
        chunksForRender = putChunkAfterChunkWithItemWithId(
          chunksBuildingResult.chunksForRender,
          chunksBuildingResult.mainInteractionChunk as ChunkedRenderListItemsChunkModel<IT>,
          childrenModification.bearingItemId as string,
        );
        this.removingChunk = chunksBuildingResult.mainInteractionChunk;
        // start animation
        this.isDuringRemovingAnimation = true;
        break;
      case 'ADDING_INDEPENDENT_PART':
      case 'INTERACTION_WITH':
        chunksBuildingResult = buildChunksForIndependentPartRender(
          createChunkId,
          resolvedChunkSize,
          childrenModification,
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
          resolvedChunkSize,
          childrenModification,
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
        ? undefined
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
      this.allRequiredChunksWasRendered = true;

      const nextModificationForRender = this.nextChildrenModificationForRender;
      if (nextModificationForRender) {
        this.nextChildrenModificationForRender = undefined;
        this.rebuildChunks(nextModificationForRender);
      } else {
        this.fixScrollPositionAfterUpdateRender();
      }
    }
  };

  // we scheduling required chunks rendering for better performance of UI
  private scheduleRequiredNotBuiltChunksChecking = () => {
    this.cancelScheduledRenderingTrying();
    this.scheduledRenderRequestId = requestAnimationFrame(this.tryRenderIfItNeed);
  };

  private cancelScheduledRenderingTrying() {
    cancelAnimationFrame(this.scheduledRenderRequestId);
  }

  private stopAllAnimation() {
    this.stopAppendChunksAnimation();
    this.stopRemovedChunksAnimation();
  }

  private stopAppendChunksAnimation() {
    if (this.isDuringAppendingAnimation) {
      this.isDuringAppendingAnimation = false;
      this.appendingChunk = undefined;
    }
  }

  private stopRemovedChunksAnimation() {
    if (this.isDuringRemovingAnimation) {
      this.isDuringRemovingAnimation = false;

      // remove built out chunk from rendered chunks in state
      const renderedChunksWithoutRemovingChunk = removeChunkFromChunks(
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.state.chunks,
        this.removingChunk as ChunkedRenderListItemsChunkModel<IT>,
      );

      this.removingChunk = undefined;

      this.setState({
        chunks: renderedChunksWithoutRemovingChunk,
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

  private onAppendingAnimationEnd = () => {
    this.stopAppendChunksAnimation();

    // run force rerender for updating chunks after animation
    this.forceUpdate(this.scheduleRequiredNotBuiltChunksChecking);
  };

  private onRemovingAnimationEnd = () => {
    this.stopRemovedChunksAnimation();

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

    return (
      <ChunkedListRenderer
        className={props.className}
        renderItem={props.renderItem}
        chunks={this.state.chunks}
        scrollListener={this.scrollListener}
        setScrollContainer={this.setScrollContainer}
        setInnerContainer={this.setInnerContainer}
        appendingChunk={this.appendingChunk}
        onAppendingAnimationEnd={this.onAppendingAnimationEnd}
        removingChunk={this.removingChunk}
        onRemovingOutAnimationEnd={this.onRemovingAnimationEnd}
      />
    );
  }
}
